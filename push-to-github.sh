#!/bin/bash

# Script para fazer push das mudanças para o GitHub
# Uso: ./push-to-github.sh

set -e

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                              ║"
echo "║                    🚀 PUSH PARA GITHUB - DROID AI AGENTS                    ║"
echo "║                                                                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Verificar se estamos na branch correta
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "feature/ai-agents-architecture" ]; then
    echo "❌ Erro: Você não está na branch feature/ai-agents-architecture"
    echo "   Branch atual: $CURRENT_BRANCH"
    echo ""
    echo "Execute: git checkout feature/ai-agents-architecture"
    exit 1
fi

echo "✅ Branch: $CURRENT_BRANCH"
echo ""

# Mostrar resumo dos commits
echo "📝 Commits a serem enviados:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
git log --oneline origin/main..HEAD 2>/dev/null || git log --oneline HEAD~3..HEAD
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Mostrar estatísticas
echo "📊 Estatísticas:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
git diff --stat origin/main...HEAD 2>/dev/null || echo "   (Estatísticas não disponíveis - primeira vez)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Perguntar confirmação
read -p "🤔 Deseja fazer push para origin/feature/ai-agents-architecture? (s/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
    echo "❌ Push cancelado pelo usuário."
    exit 0
fi

echo ""
echo "🚀 Fazendo push..."
echo ""

# Fazer push
git push -u origin feature/ai-agents-architecture

echo ""
echo "✅ Push realizado com sucesso!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Próximo passo: Criar Pull Request"
echo ""
echo "   1. Acesse: https://github.com/dronreef2/Droid"
echo "   2. Clique em 'Compare & pull request'"
echo "   3. Use o conteúdo de PULL_REQUEST_TEMPLATE.md como descrição"
echo "   4. Clique em 'Create pull request'"
echo ""
echo "   Ou use GitHub CLI:"
echo "   gh pr create --title \"feat: Estruturação completa do projeto\" \\"
echo "     --body-file PULL_REQUEST_TEMPLATE.md \\"
echo "     --base main --head feature/ai-agents-architecture"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
