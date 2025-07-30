# Script para Limpar e Recriar VPS com Senhas Corretas

$ErrorActionPreference = "Stop"

# URL do FacePanel
$FACEPANEL_URL = "http://localhost:3001"

Write-Host "Limpando e recriando VPS com senhas corretas..." -ForegroundColor Green
Write-Host ""

# 1. Buscar VPS existentes
Write-Host "1. Buscando VPS existentes..." -ForegroundColor Cyan
try {
    $existingVPS = Invoke-RestMethod -Uri "$FACEPANEL_URL/api/vps" -Method GET
    
    if ($existingVPS.success -and $existingVPS.data.Count -gt 0) {
        Write-Host "   Encontradas $($existingVPS.data.Count) VPS existentes" -ForegroundColor Yellow
        
        # 2. Excluir VPS existentes
        Write-Host "2. Excluindo VPS existentes..." -ForegroundColor Cyan
        foreach ($vps in $existingVPS.data) {
            try {
                $deleteResponse = Invoke-RestMethod -Uri "$FACEPANEL_URL/api/vps/$($vps.id)" -Method DELETE
                if ($deleteResponse.success) {
                    Write-Host "   ✅ $($vps.name) excluída" -ForegroundColor Green
                } else {
                    Write-Host "   ❌ Erro ao excluir $($vps.name): $($deleteResponse.error)" -ForegroundColor Red
                }
            }
            catch {
                Write-Host "   ❌ Erro ao excluir $($vps.name): $($_.Exception.Message)" -ForegroundColor Red
            }
            Start-Sleep -Seconds 1
        }
    } else {
        Write-Host "   Nenhuma VPS encontrada" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "   ❌ Erro ao buscar VPS: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 3. Criar VPS com senhas corretas
Write-Host "3. Criando VPS com senhas corretas..." -ForegroundColor Cyan

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

foreach ($vps in $VPS_LIST) {
    Write-Host "   Criando: $($vps.name)" -ForegroundColor White
    
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
            Write-Host "   ✅ $($vps.name) criada com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Erro: $($response.error)" -ForegroundColor Red
        }
    }
    catch {
        $errorMessage = $_.Exception.Message
        if ($_.Exception.Response) {
            try {
                $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
                $responseBody = $reader.ReadToEnd()
                Write-Host "   ❌ Erro: $responseBody" -ForegroundColor Red
            }
            catch {
                Write-Host "   ❌ Erro de conexão: $errorMessage" -ForegroundColor Red
            }
        } else {
            Write-Host "   ❌ Erro de conexão: $errorMessage" -ForegroundColor Red
        }
    }
    
    Start-Sleep -Seconds 1
}

Write-Host ""
Write-Host "✅ Processo concluído!" -ForegroundColor Green
Write-Host "🔄 Atualize a página do FacePanel para ver as mudanças" -ForegroundColor Yellow
Write-Host "🧪 Use o botão 'Verificar Status' para testar as conexões SSH" -ForegroundColor Yellow
