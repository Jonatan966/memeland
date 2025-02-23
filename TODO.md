- [x] Criar rota de listagem de memes
  - Tem que ser paginada
  - Permitir ordenação (Se possível)
- [x] Criar índice para os metadatas dos memes
  - https://developers.cloudflare.com/vectorize/reference/metadata-filtering/#examples
- [x] Remover Supabase Auth
  - ~~Capaz de fazer sentido substituir pelo Clerk~~
- [x] Migrar memes do Supabase para Cloudflare
  - Mudar ID do usuário do banco para "0b526f7c-ccc3-4f08-9b89-0a70ee3d6eea"
  - Exportar memes do Supabase e inserir no novo banco
  - Cadastrar Embeds
- [] Ajustes finais
  - [x] Fazer o seletor de ordenação funcionar corretamente
  - [x] Fazer o botão de copiar meme funcionar corretamente
  - [x] Colocar os vídeos com metade do volume por padrão
  - [] Lidar com memes que não carregam
  - [] Colocar botão de login no lugar dos botões de Novo Meme/Sair

npm run dev -- --experimental-vectorize-bind-to-prod

# Criar novo índice

```
npx wrangler vectorize create-metadata-index meme-search --property-name=user_id --type=string
```

---
