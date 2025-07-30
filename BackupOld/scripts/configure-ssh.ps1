# Script de Configuração SSH para FacePanel
# Execute este script para configurar automaticamente uma VPS

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerIP,
    
    [Parameter(Mandatory=$true)]
    [string]$Username,
    
    [string]$Port = "22"
)

Write-Host "🔑 Configurando SSH para FacePanel..." -ForegroundColor Green
Write-Host ""

# Verifica se as chaves existem
$privateKeyPath = "$env:USERPROFILE\.ssh\facepanel_key"
$publicKeyPath = "$env:USERPROFILE\.ssh\facepanel_key.pub"

if (-not (Test-Path $privateKeyPath)) {
    Write-Host "❌ Chave privada não encontrada em: $privateKeyPath" -ForegroundColor Red
    Write-Host "Execute primeiro: ssh-keygen -t rsa -b 4096 -C 'facepanel@$env:USERNAME' -f '$privateKeyPath'" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $publicKeyPath)) {
    Write-Host "❌ Chave pública não encontrada em: $publicKeyPath" -ForegroundColor Red
    exit 1
}

# Lê a chave pública
$publicKey = Get-Content $publicKeyPath

Write-Host "📋 Informações da Configuração:" -ForegroundColor Cyan
Write-Host "   Servidor: $Username@$ServerIP:$Port"
Write-Host "   Chave pública: $publicKeyPath"
Write-Host ""

Write-Host "🚀 Comandos para executar no servidor VPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Conecte-se ao servidor:"
Write-Host "   ssh $Username@$ServerIP -p $Port" -ForegroundColor White
Write-Host ""

Write-Host "2. Execute os comandos abaixo no servidor:" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Criar diretório SSH" -ForegroundColor Gray
Write-Host "mkdir -p ~/.ssh" -ForegroundColor White
Write-Host "chmod 700 ~/.ssh" -ForegroundColor White
Write-Host ""

Write-Host "# Adicionar chave pública" -ForegroundColor Gray
Write-Host "echo `"$publicKey`" >> ~/.ssh/authorized_keys" -ForegroundColor White
Write-Host ""

Write-Host "# Configurar permissões" -ForegroundColor Gray
Write-Host "chmod 600 ~/.ssh/authorized_keys" -ForegroundColor White
Write-Host ""

Write-Host "3. Teste a conexão (do seu PC):" -ForegroundColor Yellow
Write-Host "   ssh -i `"$privateKeyPath`" $Username@$ServerIP -p $Port" -ForegroundColor White
Write-Host ""

Write-Host "📋 Para o FacePanel:" -ForegroundColor Cyan
Write-Host "   Nome: [Nome da VPS]"
Write-Host "   IP: $ServerIP"
Write-Host "   Porta: $Port"
Write-Host "   Username: $Username"
Write-Host "   Private Key: [Cole o conteúdo de $privateKeyPath]"
Write-Host ""

Write-Host "✅ Script concluído! Siga os passos acima." -ForegroundColor Green
