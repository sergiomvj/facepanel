#!/bin/bash

# PanelX Docker Integration Deployment Script
# This script deploys PanelX with real Docker management capabilities

echo "🐳 PanelX - Deploy com Integração Docker Real"
echo "==============================================="

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose-docker.yml" ]; then
    echo "❌ Execute este script no diretório 'deployment'"
    exit 1
fi

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado"
    echo "   Instale com: curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
    exit 1
fi

# Verificar se o Docker está rodando
if ! docker info &> /dev/null; then
    echo "❌ Docker não está rodando"
    echo "   Inicie o Docker: sudo systemctl start docker"
    exit 1
fi

# Criar diretórios necessários
echo "📁 Criando diretórios..."
mkdir -p storage/{uploads,logs,backups,ssl}
mkdir -p database
chmod -R 755 storage/ database/

# Copiar banco de dados se existir
if [ ! -f "database/custom.db" ]; then
    echo "🗄️  Criando banco de dados..."
    touch database/custom.db
    chmod 666 database/custom.db
fi

# Usar Dockerfile com suporte Docker
echo "📝 Configurando Dockerfile com suporte Docker..."
cp Dockerfile-docker admin-panel/Dockerfile

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose -f docker-compose-docker.yml down 2>/dev/null || true

# Build e iniciar
echo "🏗️  Buildando e iniciando containers com integração Docker..."
docker-compose -f docker-compose-docker.yml build --no-cache
docker-compose -f docker-compose-docker.yml up -d

# Esperar um pouco
echo "⏳ Aguardando serviços iniciarem..."
sleep 30

# Verificar status
echo "🔍 Verificando status..."
docker-compose -f docker-compose-docker.yml ps

# Testar acesso
echo "🌐 Testando acesso..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ PanelX está rodando!"
    echo "   Acesse: http://localhost:3000"
else
    echo "⚠️  Ainda está iniciando..."
    echo "   Verifique os logs: docker-compose -f docker-compose-docker.yml logs -f panelx"
fi

# Verificar integração Docker
echo "🐍 Testando integração Docker..."
if docker-compose -f docker-compose-docker.yml exec panelx docker ps &> /dev/null; then
    echo "✅ Integração Docker está funcionando!"
    echo "   O PanelX pode gerenciar containers Docker reais"
else
    echo "⚠️  Problema na integração Docker"
    echo "   Verifique as permissões do socket Docker"
fi

echo ""
echo "🎉 Deploy concluído!"
echo ""
echo "📊 Recursos disponíveis:"
echo "   ✅ Gerenciamento real de containers Docker"
echo "   ✅ Terminal web real com exec de comandos"
echo "   ✅ Logs reais dos containers"
echo "   ✅ Monitoramento de recursos real"
echo "   ✅ O próprio PanelX aparece na lista de containers!"
echo ""
echo "🌐 Acesso: http://localhost:3000"
echo ""
echo "📊 Comandos úteis:"
echo "   Ver logs: docker-compose -f docker-compose-docker.yml logs -f"
echo "   Parar: docker-compose -f docker-compose-docker.yml down"
echo "   Reiniciar: docker-compose -f docker-compose-docker.yml restart"
echo "   Status: docker-compose -f docker-compose-docker.yml ps"
echo ""
echo "🐛 Troubleshooting:"
echo "   Se o PanelX não enxergar os containers:"
echo "   1. Verifique se o socket Docker está montado: /var/run/docker.sock"
echo "   2. Verifique permissões: docker exec panelx ls /var/run/docker.sock"
echo "   3. Teste Docker dentro do container: docker exec panelx docker ps"