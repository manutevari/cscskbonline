-- CSCSKB AI Marketing Agent — risk-based HITL migration
create extension if not exists pgcrypto;

alter table public.marketing_campaigns
  add column if not exists content_version integer not null default 1,
  add column if not exists content_hash text;

update public.marketing_campaigns
set content_hash = encode(digest(convert_to(vertical || E'\\n' || channel || E'\\n' || draft_content,'UTF8'),'sha256'),'hex')
where content_hash is null;

create or replace function public.marketing_campaign_content_guard()
returns trigger language plpgsql as $$
begin
  if new.draft_content is distinct from old.draft_content
     or new.vertical is distinct from old.vertical
     or new.channel is distinct from old.channel then
    new.content_version := old.content_version + 1;
    new.content_hash := encode(digest(convert_to(new.vertical || E'\\n' || new.channel || E'\\n' || new.draft_content,'UTF8'),'sha256'),'hex');
    if old.status = 'PENDING_APPROVAL' or old.status = 'APPROVED' then
      new.status := 'DRAFT';
      new.approved_by := null;
      new.approved_at := null;
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists marketing_campaign_content_guard on public.marketing_campaigns;
create trigger marketing_campaign_content_guard before update on public.marketing_campaigns
for each row execute function public.marketing_campaign_content_guard();

alter table public.marketing_campaigns drop constraint if exists marketing_campaigns_channel_check;
alter table public.marketing_campaigns add constraint marketing_campaigns_channel_check
  check (channel in ('whatsapp','facebook','instagram','google_business','email','website','paid_ads'));

create table if not exists public.approval_policies (
 id uuid primary key default gen_random_uuid(),
 policy_key text not null unique,
 vertical text,
 channel text,
 risk_level text not null check (risk_level in ('LOW','MEDIUM','HIGH','CRITICAL')),
 required_roles text[] not null,
 required_approvals integer not null default 1 check (required_approvals between 1 and 3),
 approval_ttl_minutes integer not null check (approval_ttl_minutes between 5 and 10080),
 active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
insert into public.approval_policies(policy_key,vertical,channel,risk_level,required_roles,required_approvals,approval_ttl_minutes) values
 ('low_internal',null,'internal','LOW',array['owner_admin','marketing_manager','operations_manager'],1,1440),
 ('medium_campaign',null,null,'MEDIUM',array['owner_admin','marketing_manager'],1,1440),
 ('high_bulk_whatsapp',null,'whatsapp','HIGH',array['owner_admin','operations_manager'],2,240),
 ('high_food_safety','food_safety',null,'HIGH',array['owner_admin','service_expert'],2,240),
 ('high_insurance_banking','insurance_banking',null,'HIGH',array['owner_admin','service_expert'],2,240),
 ('critical_paid_media',null,'paid_ads','CRITICAL',array['owner_admin','marketing_manager','operations_manager'],2,120)
on conflict(policy_key) do update set vertical=excluded.vertical,channel=excluded.channel,risk_level=excluded.risk_level,
 required_roles=excluded.required_roles,required_approvals=excluded.required_approvals,
 approval_ttl_minutes=excluded.approval_ttl_minutes,active=true,updated_at=now();

create table if not exists public.approval_requests (
 id uuid primary key default gen_random_uuid(),
 resource_type text not null check(resource_type='campaign'),
 resource_id uuid not null references public.marketing_campaigns(id) on delete restrict,
 action text not null,
 risk_level text not null check(risk_level in ('LOW','MEDIUM','HIGH','CRITICAL')),
 content_version integer not null,
 content_hash text not null,
 content_snapshot text not null,
 requested_by text not null,
 requested_by_role text not null,
 required_roles text[] not null,
 required_approvals integer not null check(required_approvals between 1 and 3),
 approvals jsonb not null default '[]'::jsonb,
 status text not null default 'PENDING' check(status in ('PENDING','APPROVED','REJECTED','CHANGES_REQUESTED','EXPIRED','CANCELLED')),
 expires_at timestamptz not null,
 decided_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists approval_requests_queue_idx on public.approval_requests(status,expires_at,created_at desc);
create index if not exists approval_requests_resource_idx on public.approval_requests(resource_id,created_at desc);

create table if not exists public.approval_events (
 id uuid primary key default gen_random_uuid(),
 approval_request_id uuid references public.approval_requests(id) on delete restrict,
 resource_type text,
 resource_id uuid,
 event_type text not null,
 actor_id text not null,
 actor_role text not null,
 details jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create index if not exists approval_events_request_idx on public.approval_events(approval_request_id,created_at);

create or replace function public.prevent_approval_event_mutation()
returns trigger language plpgsql as $$ begin raise exception 'Approval audit events are append-only'; end $$;
drop trigger if exists approval_events_no_mutation on public.approval_events;
create trigger approval_events_no_mutation before update or delete on public.approval_events
for each row execute function public.prevent_approval_event_mutation();

create table if not exists public.marketing_execution_controls (
 id boolean primary key default true check(id=true),
 paused boolean not null default true,
 paused_by text,
 paused_at timestamptz,
 reason text,
 updated_at timestamptz not null default now()
);
insert into public.marketing_execution_controls(id,paused,reason) values(true,true,'Execution remains disabled until explicitly enabled by Owner/Admin') on conflict(id) do nothing;

create table if not exists public.agent_execution_logs (
 id uuid primary key default gen_random_uuid(),
 approval_request_id uuid not null references public.approval_requests(id) on delete restrict,
 idempotency_key text not null unique,
 resource_id uuid not null references public.marketing_campaigns(id) on delete restrict,
 content_version integer not null,
 content_hash text not null,
 status text not null default 'CLAIMED' check(status in ('CLAIMED','COMPLETED','FAILED','CANCELLED')),
 claimed_at timestamptz not null default now(),
 completed_at timestamptz,
 result jsonb not null default '{}'::jsonb
);
create unique index if not exists agent_execution_one_per_approval_idx on public.agent_execution_logs(approval_request_id);

create or replace function public.decide_marketing_approval(
 p_approval_id uuid,p_actor_id text,p_actor_role text,p_decision text,p_comment text
) returns jsonb language plpgsql security definer set search_path=public as $$
declare r public.approval_requests%rowtype; c public.marketing_campaigns%rowtype;
 a jsonb; approvals_count integer; next_status text;
begin
 select * into r from public.approval_requests where id=p_approval_id for update;
 if not found then raise exception 'Approval request not found'; end if;
 if r.status <> 'PENDING' then raise exception 'Approval request is not pending'; end if;
 if now() >= r.expires_at then
   update public.approval_requests set status='EXPIRED',updated_at=now() where id=r.id;
   insert into public.approval_events(approval_request_id,resource_type,resource_id,event_type,actor_id,actor_role,details)
   values(r.id,r.resource_type,r.resource_id,'EXPIRED','system','system','{"reason":"ttl_elapsed"}');
   return jsonb_build_object('id',r.id,'status','EXPIRED');
 end if;
 select * into c from public.marketing_campaigns where id=r.resource_id for update;
 if not found or c.content_version<>r.content_version or c.content_hash<>r.content_hash then
   update public.approval_requests set status='CANCELLED',updated_at=now() where id=r.id;
   insert into public.approval_events(approval_request_id,resource_type,resource_id,event_type,actor_id,actor_role,details)
   values(r.id,r.resource_type,r.resource_id,'CANCELLED','system','system','{"reason":"version_or_hash_mismatch"}');
   return jsonb_build_object('id',r.id,'status','CANCELLED');
 end if;
 if not (p_actor_role=any(r.required_roles)) then raise exception 'Role is not authorized for this approval'; end if;
 if p_actor_id=r.requested_by then raise exception 'Requester cannot approve their own request'; end if;
 if p_decision not in ('APPROVE','REJECT','REQUEST_CHANGES') then raise exception 'Invalid decision'; end if;
 if exists(select 1 from jsonb_array_elements(r.approvals) x where x->>'actor_id'=p_actor_id or (x->>'role'=p_actor_role and x->>'decision'='APPROVE')) then raise exception 'This approver or role has already acted'; end if;
 a:=r.approvals || jsonb_build_array(jsonb_build_object('actor_id',p_actor_id,'role',p_actor_role,'decision',p_decision,'comment',left(coalesce(p_comment,''),1000),'at',now()));
 select count(*) into approvals_count from jsonb_array_elements(a) x where x->>'decision'='APPROVE';
 next_status:=case when p_decision='REJECT' then 'REJECTED' when p_decision='REQUEST_CHANGES' then 'CHANGES_REQUESTED'
   when approvals_count>=r.required_approvals then 'APPROVED' else 'PENDING' end;
 update public.approval_requests set approvals=a,status=next_status,
  decided_at=case when next_status<>'PENDING' then now() else null end,updated_at=now() where id=r.id;
 if next_status='APPROVED' then
  update public.marketing_campaigns set status='APPROVED',approved_by=p_actor_id,approved_at=now() where id=c.id;
 elsif next_status in ('REJECTED','CHANGES_REQUESTED') then
  update public.marketing_campaigns set status='REJECTED' where id=c.id;
 end if;
 insert into public.approval_events(approval_request_id,resource_type,resource_id,event_type,actor_id,actor_role,details)
 values(r.id,r.resource_type,r.resource_id,p_decision,p_actor_id,p_actor_role,jsonb_build_object('comment',left(coalesce(p_comment,''),1000),'resulting_status',next_status));
 return jsonb_build_object('id',r.id,'status',next_status,'approvals',a,'required_approvals',r.required_approvals);
end $$;

create or replace function public.claim_approved_marketing_execution(
 p_approval_id uuid,p_idempotency_key text,p_content_version integer,p_content_hash text
) returns jsonb language plpgsql security definer set search_path=public as $$
declare r public.approval_requests%rowtype; c public.marketing_campaigns%rowtype;
 e public.agent_execution_logs%rowtype; paused_now boolean;
begin
 select paused into paused_now from public.marketing_execution_controls where id=true;
 if coalesce(paused_now,true) then raise exception 'Marketing execution is paused'; end if;
 select * into r from public.approval_requests where id=p_approval_id for update;
 if not found or r.status<>'APPROVED' then raise exception 'Valid approval is required'; end if;
 if now()>=r.expires_at then raise exception 'Approval authorization expired'; end if;
 select * into c from public.marketing_campaigns where id=r.resource_id for update;
 if c.content_version<>r.content_version or c.content_version<>p_content_version or c.content_hash<>r.content_hash or c.content_hash<>p_content_hash then
  raise exception 'Approved content version/hash mismatch';
 end if;
 select * into e from public.agent_execution_logs where idempotency_key=p_idempotency_key;
 if found then return jsonb_build_object('execution_id',e.id,'status',e.status,'duplicate',true); end if;
 insert into public.agent_execution_logs(approval_request_id,idempotency_key,resource_id,content_version,content_hash)
 values(r.id,p_idempotency_key,c.id,c.content_version,c.content_hash) returning * into e;
 insert into public.approval_events(approval_request_id,resource_type,resource_id,event_type,actor_id,actor_role,details)
 values(r.id,'campaign',c.id,'EXECUTION_CLAIMED','system','executor',jsonb_build_object('execution_id',e.id,'idempotency_key',p_idempotency_key));
 return jsonb_build_object('execution_id',e.id,'status',e.status,'duplicate',false);
end $$;

alter table public.approval_policies enable row level security;
alter table public.approval_requests enable row level security;
alter table public.approval_events enable row level security;
alter table public.marketing_execution_controls enable row level security;
alter table public.agent_execution_logs enable row level security;
revoke all on public.approval_policies,public.approval_requests,public.approval_events,public.marketing_execution_controls,public.agent_execution_logs from anon,authenticated;
grant select,insert,update on public.approval_requests to service_role;
grant select,insert on public.approval_events to service_role;
grant select,insert,update on public.agent_execution_logs to service_role;
grant select on public.approval_policies to service_role;
grant select,update on public.marketing_execution_controls to service_role;
revoke all on function public.decide_marketing_approval(uuid,text,text,text,text) from public,anon,authenticated;
revoke all on function public.claim_approved_marketing_execution(uuid,text,integer,text) from public,anon,authenticated;
grant execute on function public.decide_marketing_approval(uuid,text,text,text,text) to service_role;
grant execute on function public.claim_approved_marketing_execution(uuid,text,integer,text) to service_role;
