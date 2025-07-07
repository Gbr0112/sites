# SiteBuilder Pro

Uma plataforma SaaS completa para criação de sites de delivery com integração PIX e WhatsApp.

## 🚀 Funcionalidades

- **Sites de Delivery Completos**: Templates para açaí, burger, pizza e doces
- **Carrinho de Compras**: Sistema completo com produtos e quantidades
- **Integração PIX**: Códigos QR automáticos e copia-cola
- **WhatsApp Automático**: Pedidos formatados profissionalmente
- **Analytics Individuais**: Métricas por loja (vendas, visualizações, etc.)
- **Preview em Tempo Real**: Visualização antes do deploy
- **Tema Claro/Escuro**: Interface moderna e responsiva

## 🛠️ Tecnologias

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + Drizzle ORM
- **Database**: PostgreSQL
- **Auth**: Replit OIDC
- **Deploy**: Netlify Ready

## 📦 Deploy

### Netlify (Recomendado)

1. Conecte este repositório ao Netlify
2. Configure as build settings:
   ```
   Build command: npm run build
   Publish directory: client/dist
   ```

3. Adicione as variáveis de ambiente:
   ```
   NODE_ENV=production
   DATABASE_URL=sua_postgresql_url
   SESSION_SECRET=chave_secreta
   REPL_ID=seu_replit_id
   REPLIT_DOMAINS=seusite.netlify.app
   ```

### Database Setup

Recomendamos [Neon.tech](https://neon.tech) (gratuito):
1. Crie conta e database PostgreSQL
2. Copie a connection string
3. Execute: `npm run db:push`

## 🎯 Uso

1. Usuários fazem login com Replit
2. Escolhem template (açaí, burger, pizza, doces)
3. Customizam cores, produtos e informações
4. Configuram PIX (opcional)
5. Publicam o site
6. Clientes fazem pedidos via WhatsApp

## 📄 Licença

MIT License - use livremente para projetos pessoais e comerciais.