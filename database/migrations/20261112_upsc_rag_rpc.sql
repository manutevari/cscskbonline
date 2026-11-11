-- Variable-dimension vector RPC. Keep all embeddings on one model/dimension.
CREATE OR REPLACE FUNCTION match_upsc_chunks(query_embedding vector,match_count integer DEFAULT 10,filter jsonb DEFAULT '{}'::jsonb)
RETURNS TABLE(chunk_id uuid,document_id uuid,content text,canonical_url text,title text,page_number integer,similarity real)
LANGUAGE sql STABLE AS $$
 SELECT c.id,c.document_id,c.content,d.canonical_url,d.title,NULLIF(c.metadata->>'page_number','')::integer,(1-(c.embedding <=> query_embedding))::real
 FROM upsc_document_chunks c JOIN upsc_documents d ON d.id=c.document_id
 WHERE c.embedding IS NOT NULL AND (filter='{}'::jsonb OR c.metadata @> filter)
 ORDER BY c.embedding <=> query_embedding LIMIT GREATEST(1,LEAST(match_count,50));
$$;
