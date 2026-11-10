-- Follow-up hardening for already-applied AI marketing HITL migration.
-- Approval hashes bind the exact execution target as well as the copy.
alter table public.marketing_campaigns
  drop constraint if exists marketing_campaigns_channel_check;
alter table public.marketing_campaigns
  add constraint marketing_campaigns_channel_check
  check (channel in ('whatsapp','facebook','instagram','google_business','email','website','paid_ads'));

update public.marketing_campaigns
set content_hash = encode(digest(convert_to(vertical || E'\n' || channel || E'\n' || draft_content,'UTF8'),'sha256'),'hex')
where content_hash is distinct from encode(digest(convert_to(vertical || E'\n' || channel || E'\n' || draft_content,'UTF8'),'sha256'),'hex');

create or replace function public.marketing_campaign_content_guard()
returns trigger language plpgsql as $$
begin
  if new.draft_content is distinct from old.draft_content
     or new.vertical is distinct from old.vertical
     or new.channel is distinct from old.channel then
    new.content_version := old.content_version + 1;
    new.content_hash := encode(digest(convert_to(new.vertical || E'\n' || new.channel || E'\n' || new.draft_content,'UTF8'),'sha256'),'hex');
    if old.status in ('PENDING_APPROVAL','APPROVED') then
      new.status := 'DRAFT';
      new.approved_by := null;
      new.approved_at := null;
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;

-- The critical paid-media policy now has a selectable campaign classification.
update public.approval_policies
set channel='paid_ads',risk_level='CRITICAL',
    required_roles=array['owner_admin','marketing_manager','operations_manager'],
    required_approvals=2,approval_ttl_minutes=120,active=true,updated_at=now()
where policy_key='critical_paid_media';

-- Explicitly preserve the highest-risk requirement when policies overlap.
-- Application code sorts matching policies by risk first, then specificity.
