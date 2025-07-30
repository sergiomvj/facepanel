# Script para Cadastrar VPS do .env no FacePanel
# Execute este script após iniciar o servidor FacePanel

$ErrorActionPreference = "Stop"

# URL do FacePanel (ajuste se necessário)
$FACEPANEL_URL = "http://localhost:3000"

# Configurações das VPS do .env
$VPS_LIST = @(
    @{
        name = "VPS1-Server fbrnews.co LLM"
        ip = "192.250.226.89"
        port = 22
        username = "root"
        password = "z5rlx5w6UVMvc2RW"
        auth_type = "password"
        tags = @("llm", "fbrnews", "production")
    },
    @{
        name = "VPS2-Server fbrlite.xyz Supabase"
        ip = "65.181.118.38" 
        port = 22
        username = "root"
        password = "K5Q8ztpC51LsaYz9"
        auth_type = "password"
        tags = @("supabase", "fbrlite", "database")
    },
    @{
        name = "VPS3-Server vps.fbrnow Applications"
        ip = "65.181.118.37"
        port = 22
        username = "root"
        password = "4QNouZDC4ENJmnbs"
        auth_type = "password"
        tags = @("applications", "fbrnow", "production")
    }
)

Write-Host "🚀 Cadastrando VPS no FacePanel..." -ForegroundColor Green
Write-Host ""

foreach ($vps in $VPS_LIST) {
    Write-Host "📡 Cadastrando: $($vps.name)" -ForegroundColor Cyan
    
    $body = @{
        name = $vps.name
        ip = $vps.ip
        port = $vps.port
        username = $vps.username
        password = $vps.password
        auth_type = $vps.auth_type
        tags = $vps.tags
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$FACEPANEL_URL/api/vps" -Method POST -Body $body -ContentType "application/json"
        
        if ($response.success) {
            Write-Host "   ✅ $($vps.name) cadastrada com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Erro: $($response.error)" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "   ❌ Erro de conexão: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 1
}

Write-Host ""
Write-Host "🎯 Cadastro concluído!" -ForegroundColor Green
Write-Host "   Acesse: $FACEPANEL_URL para ver suas VPS" -ForegroundColor Yellow
