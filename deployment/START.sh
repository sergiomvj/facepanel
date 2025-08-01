#!/bin/bash

echo "🚀 PanelX - Deploy Super Simples"
echo "=================================="

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose-simple.yml" ]; then
    echo "❌ Execute este script no diretório 'deployment'"
    exit 1
fi

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado"
    echo "   Instale com: curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
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

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose -f docker-compose-simple.yml down 2>/dev/null || true

# Usar Dockerfile simples
echo "📝 Configurando Dockerfile..."
cp Dockerfile-simple admin-panel/Dockerfile

# Build e iniciar
echo "🏗️  Buildando e iniciando containers..."
docker-compose -f docker-compose-simple.yml build --no-cache
docker-compose -f docker-compose-simple.yml up -d

# Esperar um pouco
echo "⏳ Aguardando serviços iniciarem..."
sleep 30

# Verificar status
echo "🔍 Verificando status..."
docker-compose -f docker-compose-simple.yml ps

# Testar acesso
echo "🌐 Testando acesso..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ PanelX está rodando!"
    echo "   Acesse: http://localhost:3000"
else
    echo "⚠️  Ainda está iniciando..."
    echo "   Verifique os logs: docker-compose -f docker-compose-simple.yml logs -f panelx"
fi

echo ""
echo "🎉 Deploy concluído!"
echo ""
echo "📊 Comandos úteis:"
echo "   Ver logs: docker-compose -f docker-compose-simple.yml logs -f"
echo "   Parar: docker-compose -f docker-compose-simple.yml down"
echo "   Reiniciar: docker-compose -f docker-compose-simple.yml restart"
echo "   Status: docker-compose -f docker-compose-simple.yml ps"