# 🐾 Pet Register - Gestão Veterinária & Histórico Vacinal

Uma plataforma moderna de gestão clínica para pets, construída para simplificar o controle de saúde, histórico vacinal e dados cadastrais, garantindo alto isolamento e privacidade.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) ![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

[✨ Live Demo](#) • [📖 Endpoints da API](#endpoints-da-api-rest) • [🚀 Como Rodar Localmente](#guia-de-instalação-e-execução)

---

## Destaques & Features

- 🛡️ **Autenticação Híbrida & Multi-tenant**: Acesso seguro garantido por senhas protegidas com `bcrypt` e JWT, login via **Google OAuth2** com apenas 1 clique, e botão de **Acesso Rápido (Modo Demo)** preparado para testes de recrutadores.
- 🔒 **Isolamento de Dados Estrito**: Operações desenhadas em arquitetura Multi-tenant, onde cada usuário logado manipula, de forma totalmente isolada e auditada, a sua própria carteira de pacientes e pets.
- ⚡ **Persistência Confiável (SQLite Nativo)**: Construído com `node:sqlite`, a plataforma utiliza chaves estrangeiras, `ON DELETE CASCADE` rigoroso e consultas parametrizadas para máxima integridade e proteção contra Injeção de SQL.
- 🖨️ **Carteira de Vacinação A4 (Exportação em PDF)**: Geração dinâmica de laudo timbrado pronto para impressão (graças ao `@media print`), cálculo do *Status* de vacinas (Em dia / Atrasada) e assinaturas clínicas.
- 🎂 **Cálculo Inteligente de Idade**: Visualização em tempo real ("live preview") convertendo datas de nascimento selecionadas no calendário para idade humana e amigável (ex: *1 ano e 3 meses*, *Recém-nascido*).
- 🧪 **Qualidade e Testes Automatizados**: API validada pela suíte de testes de integração nativa do Node (`node:test` e `node:assert`), garantindo 100% de sucesso nos fluxos de registro e deleção.

---

## Guia de Instalação e Execução

### 1. Clonar e Instalar Dependências
```bash
# Clone o repositório
git clone https://github.com/Adrielbarr0s/pet-register.git
cd pet-register

# Instale as dependências do Backend
cd pet-register-backend
npm install
```

### 2. Configurar o Ambiente Backend (.env)
Crie um arquivo `.env` dentro de `pet-register-backend` com:
```env
PORT=3000
JWT_SECRET=super_secret_jwt_key
```

### 3. Executar o Backend
```bash
# Rode a seed (Opcional - Cria usuários e pets de demonstração)
npm run seed

# Inicie o servidor
npm run dev
# Ou no modo de produção: npm start
```

### 4. Executar o Frontend
Abra um novo terminal:
```bash
cd pet-register/pet-register-frontend
# Use o pacote serve para servir estaticamente
npx serve . -p 8080
```
Acesse `http://localhost:8080`.

---

## Endpoints da API REST

| Método | Rota | Proteção | Descrição |
|--------|------|----------|-----------|
| `POST` | `/api/auth/register` | Pública | Cria um novo usuário com e-mail e senha. |
| `POST` | `/api/auth/login` | Pública | Login por e-mail e senha (Retorna JWT). |
| `POST` | `/api/auth/demo` | Pública | Retorna o acesso rápido ao usuário de demonstração. |
| `POST` | `/api/auth/google` | Pública | Valida credenciais do Google OAuth2. |
| `GET`  | `/api/pets` | 🔒 JWT | Lista pets paginados (filtros: espécie, busca). |
| `POST` | `/api/pets` | 🔒 JWT | Cadastra um novo pet associado ao usuário logado. |
| `PUT`  | `/api/pets/:id` | 🔒 JWT | Edita informações cadastrais (incluindo idade/nascimento). |
| `DELETE`|`/api/pets/:id` | 🔒 JWT | Exclui pet e todo seu histórico (CASCADE). |
| `GET`  | `/api/pets/:id/vacinas` | 🔒 JWT | Lista o histórico vacinal do paciente. |
| `POST` | `/api/pets/:id/vacinas` | 🔒 JWT | Registra uma nova aplicação com previsão da próxima dose. |

---

## Instruções de Deploy

O projeto já possui os scripts e regras prontas para deploy em nuvem (PaaS):

**Backend no Render.com:**
1. Crie um **Web Service** conectado ao seu GitHub.
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Variáveis: Configure `JWT_SECRET`.

**Frontend na Vercel:**
1. Crie um novo **Project** importando o repositório.
2. Root Directory: `pet-register-frontend`
3. O arquivo `vercel.json` integrado se encarregará de usar o padrão _Clean URLs_.
4. Atualize a variável `BASE_URL` no `app.js` para a URL fornecida pelo Render.
