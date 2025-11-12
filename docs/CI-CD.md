# CI/CD Pipeline Documentation

Sistema completo de CI/CD usando GitHub Actions para garantir qualidade, segurança e automação do código.

## 🎯 Visão Geral

O pipeline de CI/CD do Droid AI é composto por múltiplos workflows que executam verificações automáticas em cada push e pull request, garantindo que apenas código de qualidade seja integrado à branch principal.

## 🔄 Workflows Disponíveis

### 1. CI (Continuous Integration) 🏗️

**Arquivo**: `.github/workflows/ci.yml`

**Triggers**:
- Push para `main` ou `develop`
- Pull Requests para `main` ou `develop`

**Jobs**:

#### Lint
- Executa ESLint para verificar padrões de código
- Falha se houver erros de linting
- Comando: `npm run lint`

#### Test
- Executa todos os testes unitários
- Gera relatório de cobertura
- Upload automático para Codecov (opcional)
- Comando: `npm test -- --coverage --passWithNoTests`

#### Build
- Compila o projeto TypeScript
- Verifica se o diretório `dist/` foi criado
- Depende de: Lint e Test passarem
- Comando: `npm run build`

#### Type Check
- Valida tipos TypeScript sem gerar arquivos
- Detecta erros de tipagem
- Comando: `npx tsc --noEmit`

#### Security Audit
- Executa `npm audit` para vulnerabilidades
- Nível: moderate ou superior
- Não bloqueia o pipeline (continue-on-error)

#### All Checks
- Job final que valida se todos os anteriores passaram
- Ponto único de verificação para branch protection

**Exemplo de execução**:
```bash
✅ Lint - 30s
✅ Test - 45s
✅ Type Check - 25s
⚠️ Security - 15s (com avisos)
✅ Build - 40s
✅ All Checks - 5s
```

---

### 2. PR Validation 🔍

**Arquivo**: `.github/workflows/pr-validation.yml`

**Triggers**:
- Pull Request opened, synchronize, reopened, ready_for_review

**Jobs**:

#### PR Quality Checks
- **Semantic PR Title**: Valida formato do título
  - Tipos aceitos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
  - Exemplo válido: `feat: Add WebSocket support`
  
- **Merge Conflicts**: Detecta conflitos com a branch base
  
- **Large Files**: Alerta sobre arquivos maiores que 1MB
  
- **Secrets Detection**: Escaneia por credenciais expostas (TruffleHog)

#### Dependencies Check
- Detecta mudanças em `package.json` ou `package-lock.json`
- Valida sincronização entre os arquivos
- Garante que `package-lock.json` está correto

#### Code Coverage Report
- Executa testes com cobertura
- Comenta no PR com métricas detalhadas
- Remove comentários antigos automaticamente

#### Auto Labeling
- **Label by Files**: Labels baseadas em arquivos modificados
  - `documentation`: arquivos .md
  - `dependencies`: package.json/lock
  - `tests`: arquivos .spec.ts
  - `module:*`: por módulo modificado
  
- **Size Label**: Tamanho do PR
  - `size/XS`: ≤ 10 linhas
  - `size/S`: ≤ 100 linhas
  - `size/M`: ≤ 500 linhas
  - `size/L`: ≤ 1000 linhas
  - `size/XL`: > 1000 linhas

---

### 3. CodeQL Security Scanning 🔒

**Arquivo**: `.github/workflows/codeql.yml`

**Triggers**:
- Push para `main` ou `develop`
- Pull Requests
- Agendado: Segundas-feiras às 00:00 UTC

**Características**:
- Análise estática de segurança
- Detecta vulnerabilidades comuns (OWASP Top 10)
- Queries: `security-and-quality`
- Resultados na aba "Security" do GitHub
- Suporta JavaScript/TypeScript

**Alertas detectados**:
- SQL Injection
- XSS (Cross-Site Scripting)
- Path Traversal
- Command Injection
- Hardcoded Secrets
- Unsafe Deserialization

---

## 📊 Configuração de Labels

**Arquivo**: `.github/labeler.yml`

Labels automáticas baseadas em arquivos modificados:

| Label | Arquivos |
|-------|----------|
| `documentation` | `**/*.md`, `docs/**/*` |
| `dependencies` | `package.json`, `package-lock.json` |
| `config` | `*.config.{js,ts}`, `.env.example`, `tsconfig.json` |
| `ci-cd` | `.github/**/*`, `Dockerfile`, `docker-compose.yml` |
| `tests` | `**/*.spec.ts`, `**/*.test.ts` |
| `backend` | `src/**/*.ts` |
| `module:auth` | `src/modules/auth/**/*` |
| `module:users` | `src/modules/users/**/*` |
| `module:agents` | `src/modules/agents/**/*` |
| `module:tasks` | `src/modules/tasks/**/*` |
| `module:integrations` | `src/modules/integrations/**/*` |
| `module:events` | `src/events/**/*` |

---

## 🔧 Configuração no Repositório

### Branch Protection Rules

Recomendado configurar para `main`:

1. **Acesse**: Settings → Branches → Add rule
2. **Branch name pattern**: `main`
3. **Ative**:
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - Status checks obrigatórios:
     - `Lint`
     - `Test`
     - `Build`
     - `Type Check`
     - `All Checks Passed`
   - ✅ Require pull request reviews before merging (1 aprovação)
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Require linear history
   - ✅ Include administrators

### Secrets Necessários

Configure em: Settings → Secrets and variables → Actions

| Secret | Descrição | Obrigatório |
|--------|-----------|-------------|
| `CODECOV_TOKEN` | Token para upload de cobertura | Opcional |
| `GITHUB_TOKEN` | Gerado automaticamente | ✅ Automático |

---

## 🚀 Uso dos Workflows

### Para Desenvolvedores

#### Criando um Pull Request

1. **Título do PR** deve seguir formato Conventional Commits:
   ```
   feat: Adiciona suporte a WebSocket
   fix: Corrige erro na autenticação
   docs: Atualiza README com badges
   ```

2. **Aguarde os checks** passarem:
   - CI (lint, test, build)
   - PR Validation (título, conflitos, cobertura)
   - CodeQL (segurança)

3. **Revise os comentários automáticos**:
   - Cobertura de código
   - Warnings de arquivos grandes
   - Labels aplicadas

4. **Correções**:
   ```bash
   # Se lint falhar
   npm run lint
   
   # Se tests falharem
   npm test
   
   # Se build falhar
   npm run build
   ```

#### Testando Localmente Antes de Push

```bash
# Executar todos os checks manualmente
npm run lint
npm test
npm run build
npx tsc --noEmit
npm audit
```

---

### Para Maintainers

#### Aprovando Pull Requests

Antes de aprovar, verifique:

- ✅ Todos os checks do CI passaram
- ✅ Cobertura de testes mantida ou aumentada
- ✅ Sem alertas de segurança (CodeQL)
- ✅ PR title está correto (semantic)
- ✅ Sem merge conflicts
- ✅ Código revisado manualmente
- ✅ Documentação atualizada (se necessário)

#### Merge Strategy

Recomendado: **Squash and Merge**

```
feat: Add WebSocket support (#123)

- Implementa EventsGateway com Socket.IO
- Adiciona autenticação JWT para WebSocket
- Cria EventsService para emissão de eventos
- Atualiza documentação

Co-authored-by: Contributor <email>
```

---

## 📈 Métricas e Monitoramento

### Dashboards Disponíveis

1. **Actions Tab**: 
   - Histórico de execuções
   - Tempo médio de build
   - Taxa de sucesso/falha

2. **Pull Requests Tab**:
   - Labels automáticas
   - Status dos checks
   - Comentários de cobertura

3. **Security Tab**:
   - Alertas do CodeQL
   - Dependabot alerts
   - Secret scanning alerts

### Análise de Performance

```bash
# Tempos médios esperados:
Lint:       ~30s
Test:       ~45s
Build:      ~40s
Type Check: ~25s
Security:   ~15s
Total:      ~3min
```

---

## 🔄 Melhorias Futuras

Potenciais adições ao pipeline:

### Curto Prazo
- [ ] E2E tests no CI
- [ ] Visual regression testing
- [ ] Performance benchmarks
- [ ] Docker image building

### Médio Prazo
- [ ] Deploy automático para staging
- [ ] Smoke tests pós-deploy
- [ ] Rollback automático
- [ ] Notificações Slack/Discord

### Longo Prazo
- [ ] Deploy para produção com aprovação manual
- [ ] Canary deployments
- [ ] Feature flags
- [ ] A/B testing

---

## 🐛 Troubleshooting

### CI falhando com "Module not found"

**Solução**:
```bash
# Limpe cache e reinstale
rm -rf node_modules package-lock.json
npm install
```

### Tests passam localmente mas falham no CI

**Possíveis causas**:
- Testes dependendo de tempo/timezone
- Arquivos não commitados
- Variáveis de ambiente faltando

**Solução**:
```bash
# Simule ambiente CI localmente
CI=true npm test
```

### Build timeout no CI

**Solução**:
```yaml
# Aumentar timeout no workflow
- name: Build application
  run: npm run build
  timeout-minutes: 10  # Adicionar esta linha
```

### CodeQL falsos positivos

**Solução**:
1. Adicione comentário no código:
   ```typescript
   // codeql[js/sql-injection]
   const query = userInput;  // Validado anteriormente
   ```

2. Ou crie `.github/codeql/codeql-config.yml`:
   ```yaml
   queries:
     - uses: security-and-quality
   query-filters:
     - exclude:
         id: js/sql-injection
   ```

---

## 📚 Recursos Adicionais

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [Jest Coverage Reports](https://jestjs.io/docs/configuration#coveragereporters-arraystring--string-options)

---

## ✅ Checklist de Implementação

Para novos projetos implementando este CI/CD:

- [ ] Copiar workflows para `.github/workflows/`
- [ ] Copiar `labeler.yml` para `.github/`
- [ ] Adicionar badges no README
- [ ] Configurar branch protection rules
- [ ] Configurar secrets (se necessário)
- [ ] Testar com primeiro PR
- [ ] Documentar processo interno da equipe
- [ ] Treinar desenvolvedores nos novos workflows

---

**Documentação criada em**: 2024  
**Última atualização**: Auto-atualizada via Git  
**Maintainer**: Guilherme Dron (@dronreef2)
