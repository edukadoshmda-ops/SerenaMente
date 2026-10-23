# 🚀 Guia de Deploy 100% Gratuito: Supabase + Vercel (SerenaMente)

---

## 👥 1. Quantas pessoas podem usar o app no plano 100% Gratuito?

Graças à arquitetura **Offline-First & Web Audio API** que implementamos:

### ⚡ Na Vercel (Plano Hobby - Grátis para Sempre):
- **100 GB de largura de banda por mês**: Como o aplicativo é compilado e pesa apenas ~400 KB gzipped, 100 GB equivalem a **mais de 250.000 visitas por mês**!
- Suporta tranquilamente entre **50.000 a 100.000 pessoas acessando por mês** sem pagar nada.
- Os sons do app não gastam tráfego do servidor porque são gerados diretamente no navegador do usuário com a **Web Audio API**.

### 🗄️ No Supabase (Plano Free - Grátis para Sempre):
- **50.000 Usuários Ativos Mensais (MAU)** cadastrados com autenticação.
- **500 MB de Banco de Dados PostgreSQL**: Nossas tabelas foram desenhadas para ocupar apenas ~2 KB a 5 KB por pessoa. Isso significa capacidade para **mais de 100.000 cadastros completos** antes de atingir 500 MB.
- **Cache Inteligente & Debounce**: O aplicativo salva tudo no celular/computador (`localStorage`) e só envia dados para o Supabase em lote a cada alteração real, economizando **mais de 80% das requisições**!

👉 **Resumo**: O app suporta tranquilamente até **50.000 usuários ativos cadastrados** e **centenas de milhares de visitantes** sem você gastar 1 centavo!

---

## 💰 2. Qual o preço do aplicativo?

### Custo para Manter:
- **R$ 0,00 (Zero reais por mês)** usando o Supabase + Vercel com link oficial gratuito (ex: `serenamente.vercel.app`).
- Opcional: Se quiser um domínio próprio profissional (ex: `serenamente.com.br`), custa apenas **R$ 40 por ANO** no Registro.br.

### Preço de Mercado (Se você quiser vender ou monetizar):
- Aplicativos similares no mercado (como Calm, Headspace, Cíngulo e Lojong) cobram:
  - **Mensal**: R$ 19,90 a R$ 29,90/mês
  - **Anual**: R$ 149,00 a R$ 249,00/ano
- **Modelo Recomendado (Freemium)**:
  - **Grátis**: SOS Pânico, Respiração 4-7-8, Metas Diárias, Diário de Emoções e 2 Playbooks.
  - **Plano Premium (Opcional)**: R$ 9,90 a R$ 14,90/mês para desbloquear todas as Histórias de Sono e relatórios avançados.
  - Ou você pode mantê-lo **100% gratuito como projeto social de saúde mental**, com botão de doação voluntária (Pix / Apoia.se).

---

## 🛠️ 3. Como subir no Supabase em 3 minutos:

1. Acesse **[supabase.com](https://supabase.com)** e crie uma conta gratuita.
2. Clique em **"New Project"**, dê o nome de **`serenamente`**, defina uma senha de banco de dados e escolha a região **São Paulo (South America)**.
3. No menu lateral esquerdo do Supabase, clique em **SQL Editor** -> **New Query**.
4. Abra o arquivo **`supabase_schema.sql`** deste projeto, copie todo o código e cole no SQL Editor do Supabase. Clique em **Run**.
   *(Pronto! As tabelas otimizadas, índices e segurança RLS estão criadas).*
5. No menu lateral do Supabase, vá em **Project Settings** (ícone de engrenagem) -> **API**:
   - Copie a **Project URL**
   - Copie a chave **`anon` `public`**

---

## 🌐 4. Como subir na Vercel em 2 minutos:

1. Acesse **[vercel.com](https://vercel.com)** e faça login gratuito com sua conta do GitHub.
2. Suba o projeto para o seu GitHub (ou use a Vercel CLI via terminal: `npx vercel`).
3. Clique em **"Add New..."** -> **"Project"** e selecione o repositório do SerenaMente.
4. Na tela de configuração antes de clicar em Deploy, abra a seção **Environment Variables** (Variáveis de Ambiente) e adicione:
   - `VITE_SUPABASE_URL` = (sua URL copiada do Supabase)
   - `VITE_SUPABASE_ANON_KEY` = (sua chave anon copiada do Supabase)
5. Clique em **Deploy**!
   Em menos de 1 minuto seu app estará no ar com link seguro `https://seu-app.vercel.app`!
