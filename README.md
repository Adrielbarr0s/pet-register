# Pet Register - Gestão Veterinária

Um sistema completo de Gestão Veterinária e Histórico Vacinal, focado em agilidade, responsividade e com uma interface premium e moderna em modo noturno.

## 🛠️ Tecnologias Utilizadas

**Backend:**
- **Node.js** (Ambiente de Execução)
- **Express.js** (Framework Web)
- **SQLite Nativo (`node:sqlite`)** (Banco de Dados Leve e Rápido)
- **Zod** (Validação de Dados)
- **CORS & Helmet** (Segurança)
- **Node.js Test Runner (`node:test`)** (Testes Automatizados)

**Frontend:**
- **HTML5, CSS3, JavaScript Vanilla**
- **Tailwind CSS** (Estilização via CDN)
- **FontAwesome 6** (Ícones)
- **SweetAlert2** (Modais de Confirmação Modernos)
- **Toastify.js** (Notificações não-intrusivas)

---

## 📂 Arquitetura de Diretórios

```
pet-register/
├── pet-register-backend/      # API Restful Node.js
│   ├── src/
│   │   ├── config/            # Configurações do Banco de Dados e Script de Seed
│   │   ├── controllers/       # Lógica de Negócios (Pets e Vacinas)
│   │   ├── routes/            # Definições de Rotas Express
│   │   ├── schemas/           # Schemas de Validação (Zod)
│   │   └── server.js          # Ponto de Entrada da API
│   ├── test/                  # Testes Automatizados
│   ├── database.sqlite        # Banco de Dados
│   └── package.json           # Dependências e Scripts
└── pet-register-frontend/     # Interface Vanilla JS
    ├── index.html             # Marcação e Layout Tailwind
    ├── app.js                 # Lógica de Integração com API
    └── ...
```

---

## 🚀 Como Inicializar o Projeto

Siga os passos abaixo para iniciar a aplicação na sua máquina local:

### 1. Inicializando o Backend
Navegue até a pasta do backend e instale as dependências:
```bash
cd pet-register-backend
npm install
```

**Popule o banco de dados com dados de teste (Seed):**
```bash
npm run seed
```

**Execute os testes automatizados:**
```bash
npm run test
```

**Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```
A API estará rodando em `http://localhost:3000`.

### 2. Inicializando o Frontend
O frontend foi desenvolvido com Vanilla JS e Tailwind via CDN. Não há necessidade de build.
Você pode rodar a interface abrindo o arquivo `pet-register-frontend/index.html` em seu navegador, ou usando um servidor estático simples como o Live Server do VSCode.

---

## 🌐 Endpoints da API

Abaixo está a lista completa de rotas disponíveis na nossa API:

| Método | Endpoint                    | Descrição                                                                 |
|--------|-----------------------------|---------------------------------------------------------------------------|
| `GET`  | `/api/pets`                 | Lista todos os pets (com suporte a paginação `?page=1&limit=6` e filtros) |
| `GET`  | `/api/pets/:id`             | Obtém os detalhes de um pet específico                                    |
| `POST` | `/api/pets`                 | Cadastra um novo pet                                                      |
| `PUT`  | `/api/pets/:id`             | Atualiza os dados de um pet existente                                     |
| `DELETE`| `/api/pets/:id`            | Exclui um pet e todo o seu histórico vacinal em cascata                   |
| `GET`  | `/api/pets/:petId/vacinas`  | Lista o histórico de vacinas de um pet específico                         |
| `POST` | `/api/pets/:petId/vacinas`  | Registra uma nova vacina para um pet                                      |
| `DELETE`| `/api/pets/vacinas/:id`    | Remove um registro de vacina do histórico                                 |

---

## 🎨 Funcionalidades da Interface

- **Dark Mode Moderno:** UI projetada com paleta baseada no `slate-950` do Tailwind, com detalhes em `emerald-500` para destaque.
- **Responsividade:** Layout adaptável para smartphones, tablets e desktops usando flexbox e CSS Grid.
- **Filtros e Busca em Tempo Real:** Pesquise por nome do tutor/pet e filtre por espécie (`Cachorro`, `Gato`, `Ave`, `Outro`).
- **Feedback Visual:** Interações suaves e alertas amigáveis com Toastify e SweetAlert2.
- **Histórico Vacinal Dinâmico:** Gerencie as vacinas de um pet em um modal sem precisar recarregar a página.
