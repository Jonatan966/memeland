- [x] Criar rota de listagem de memes
    - Tem que ser paginada
    - Permitir ordenação (Se possível)
- [x] Criar índice para os metadatas dos memes
    - https://developers.cloudflare.com/vectorize/reference/metadata-filtering/#examples
- [ ] Migrar memes do Supabase para Cloudflare
    - Checar se é possível reaproveitar os embbeds já gerados
- [ ] Remover Supabase Auth
    - Capaz de fazer sentido substituir pelo Clerk

npm run dev -- --experimental-vectorize-bind-to-prod

# Criar novo índice
```
npx wrangler vectorize create-metadata-index meme-search --property-name=user_id --type=string
```

---
