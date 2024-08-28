create or replace function search_memes (
  query_embedding vector,
  similarity_threshold float,
  match_count int,
  owner_id uuid
)
returns table (
  id uuid,
  description text,
  keywords text[],
  user_id uuid,
  file text,
  type text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    memes.id,
    memes.description,
    memes.keywords,
    memes.user_id,
    memes.file,
    memes.type,
    1 - (memes.new_embedding <=> query_embedding) as similarity
  from memes
  where 1 - (memes.new_embedding <=> query_embedding) > similarity_threshold and memes.user_id = owner_id
  order by similarity desc
  limit match_count;
end;
$$;