# 🤖 Droid AI Agents

Sistema avançado de gerenciamento e orquestração de agentes de IA com integração LLM. Arquitetura enterprise-grade construída com NestJS, TypeScript, PostgreSQL e Redis.

## 🚀 Características

- **Arquitetura Modular**: Estrutura bem organizada seguindo padrões de arquitetura limpa
- **Autenticação JWT**: Sistema completo de autenticação e autorização
- **TypeScript Strict**: Type-safety completa em todo o projeto
- **Validação Robusta**: Validação de dados com class-validator
- **ORM TypeORM**: Gerenciamento de banco de dados PostgreSQL
- **Queue System**: Processamento assíncrono com Bull + Redis
- **Documentação Swagger**: API totalmente documentada
- **Testes**: Configuração completa com Jest
- **Logs Estruturados**: Interceptors para logging detalhado
- **Error Handling**: Tratamento global de erros

## 📋 Pré-requisitos

- Node.js >= 18.0.0
- npm >= 8.0.0
- Docker & Docker Compose (para banco de dados)
- PostgreSQL 15+ (se não usar Docker)
- Redis 7+ (se não usar Docker)

## 🛠️ Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/dronreef2/Droid.git
cd Droid
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Inicie os serviços com Docker**
```bash
docker-compose up -d
```

## 🎯 Uso

### Desenvolvimento
```bash
# Modo watch (recarrega automaticamente)
npm run start:dev

# Modo debug
npm run start:debug
```

### Produção
```bash
# Build
npm run build

# Executar
npm run start:prod
```

### Testes
```bash
# Testes unitários
npm test

# Testes com watch
npm run test:watch

# Cobertura de testes
npm run test:cov

# Testes E2E
npm run test:e2e
```

### Linting e Formatação
```bash
# Lint
npm run lint

# Format
npm run format
```

## 📚 Documentação da API

Após iniciar a aplicação, acesse a documentação interativa Swagger:

```
http://localhost:3000/api/docs
```

## 🏗️ Estrutura do Projeto

```
src/
├── config/              # Configurações (database, redis, app)
├── modules/            
│   ├── auth/           # Autenticação e autorização
│   ├── users/          # Gerenciamento de usuários
│   ├── agents/         # Gerenciamento de agentes de IA
│   ├── tasks/          # Orquestração de tarefas
│   └── integrations/   # Integrações com LLMs
├── shared/
│   ├── filters/        # Exception filters
│   ├── interceptors/   # Interceptors (logging, transform)
│   ├── guards/         # Guards de autenticação
│   ├── pipes/          # Validation pipes
│   ├── decorators/     # Custom decorators
│   ├── interfaces/     # Interfaces compartilhadas
│   ├── constants/      # Constantes
│   └── utils/          # Utilitários
├── app.module.ts       # Módulo principal
└── main.ts            # Entry point
```

## 🔧 Stack Tecnológica

- **Framework**: NestJS 10
- **Linguagem**: TypeScript 5
- **Banco de Dados**: PostgreSQL 15
- **ORM**: TypeORM 0.3
- **Cache/Queue**: Redis 7 + Bull
- **Autenticação**: JWT (Passport)
- **Validação**: class-validator + class-transformer
- **Documentação**: Swagger/OpenAPI
- **Testes**: Jest + Supertest
- **Linting**: ESLint + Prettier

## 🌐 Endpoints Principais

### Autenticação
- `POST /api/v1/auth/register` - Registro de usuário
- `POST /api/v1/auth/login` - Login

### Usuários
- `GET /api/v1/users` - Listar usuários (requer autenticação)

### Agentes (Em desenvolvimento)
- `POST /api/v1/agents` - Criar agente de IA
- `GET /api/v1/agents` - Listar agentes
- `GET /api/v1/agents/:id` - Obter agente específico
- `PATCH /api/v1/agents/:id` - Atualizar agente
- `DELETE /api/v1/agents/:id` - Deletar agente

### Tasks (Em desenvolvimento)
- Endpoints para gerenciamento de tarefas e execuções

### Integrations (Em desenvolvimento)
- Endpoints para integrações com provedores LLM

## 🔐 Variáveis de Ambiente

Veja o arquivo `.env.example` para todas as variáveis disponíveis:

- Configurações da aplicação (porta, CORS, JWT)
- Configurações de banco de dados
- Configurações de Redis
- Chaves de API para integrações LLM

## 📦 Scripts NPM

- `npm run build` - Build do projeto
- `npm start` - Inicia a aplicação
- `npm run start:dev` - Modo desenvolvimento com watch
- `npm run start:debug` - Modo debug
- `npm run start:prod` - Modo produção
- `npm test` - Executa testes
- `npm run test:watch` - Testes em modo watch
- `npm run test:cov` - Cobertura de testes
- `npm run test:e2e` - Testes E2E
- `npm run lint` - Linting
- `npm run format` - Formatação de código

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Roadmap

- [x] Estrutura base do projeto
- [x] Sistema de autenticação
- [x] Módulo de usuários
- [ ] Módulo de agentes de IA completo
- [ ] Módulo de tarefas e orquestração
- [ ] Integrações com LLM providers (OpenRouter, OpenAI, Anthropic)
- [ ] Sistema de plugins extensível
- [ ] Dashboard de monitoramento
- [ ] Métricas e observabilidade
- [ ] CI/CD pipeline

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

**Guilherme Dron**

- GitHub: [@dronreef2](https://github.com/dronreef2)

---

Feito com ❤️ e TypeScript