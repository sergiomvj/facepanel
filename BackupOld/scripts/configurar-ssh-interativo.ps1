# Script Interativo para Configurar SSH com Chaves
# Execute este script e siga as instruções

$PUBLIC_KEY = Get-Content "$env:USERPROFILE\.ssh\facepanel_key.pub"

Write-Host "=== CONFIGURACAO SSH COM CHAVES ===" -ForegroundColor Green
Write-Host ""
Write-Host "Sua chave publica:" -ForegroundColor Cyan
Write-Host "$PUBLIC_KEY" -ForegroundColor Yellow
Write-Host ""

$VPS_LIST = @(
    @{ name = "VPS2 fbrlite.xyz (FUNCIONANDO)"; ip = "65.181.118.38"; password = "K5Q8ztpC51LsaYz9" },
    @{ name = "VPS1 fbrnews.co"; ip = "192.250.226.89"; password = "z5rlx5w6UVMvc2RW" },
    @{ name = "VPS3 vps.fbrnow"; ip = "65.181.118.37"; password = "4QNouZDC4ENJmnbs" }
)

foreach ($vps in $VPS_LIST) {
    Write-Host "============================================================" -ForegroundColor Gray
    Write-Host "CONFIGURANDO: $($vps.name)" -ForegroundColor Cyan
    Write-Host "IP: $($vps.ip)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "COMANDOS PARA EXECUTAR MANUALMENTE:" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "1. CONECTE-SE A VPS:" -ForegroundColor Green
    Write-Host "   ssh -o StrictHostKeyChecking=no root@$($vps.ip)" -ForegroundColor White
    Write-Host "   Senha: $($vps.password)" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "2. EXECUTE NA VPS (copie linha por linha):" -ForegroundColor Green
    Write-Host ""
    Write-Host "# Criar diretorio SSH" -ForegroundColor Gray
    Write-Host "mkdir -p ~/.ssh" -ForegroundColor White
    Write-Host ""
    
    Write-Host "# Definir permissoes" -ForegroundColor Gray
    Write-Host "chmod 700 ~/.ssh" -ForegroundColor White
    Write-Host ""
    
    Write-Host "# Adicionar chave publica (COLE TUDO NUMA LINHA SO):" -ForegroundColor Gray
    Write-Host "echo '$PUBLIC_KEY' >> ~/.ssh/authorized_keys" -ForegroundColor White
    Write-Host ""
    
    Write-Host "# Configurar permissoes finais" -ForegroundColor Gray
    Write-Host "chmod 600 ~/.ssh/authorized_keys" -ForegroundColor White
    Write-Host ""
    
    Write-Host "# Sair da VPS" -ForegroundColor Gray
    Write-Host "exit" -ForegroundColor White
    Write-Host ""
    
    Write-Host "3. TESTAR CONEXAO (do seu PC):" -ForegroundColor Green
    Write-Host "   ssh -i `"$env:USERPROFILE\.ssh\facepanel_key`" root@$($vps.ip)" -ForegroundColor White
    Write-Host ""
    
    $resposta = Read-Host "Configurou esta VPS? (s/n)"
    if ($resposta -eq 's' -or $resposta -eq 'S') {
        Write-Host "   ✅ $($vps.name) configurada!" -ForegroundColor Green
        
        Write-Host "   Testando conexao..." -ForegroundColor Yellow
        try {
            $testResult = ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no -i "$env:USERPROFILE\.ssh\facepanel_key" root@$($vps.ip) "echo 'SSH OK'"
            if ($testResult -eq "SSH OK") {
                Write-Host "   ✅ TESTE SSH: SUCESSO!" -ForegroundColor Green
            } else {
                Write-Host "   ❌ TESTE SSH: FALHOU" -ForegroundColor Red
            }
        }
        catch {
            Write-Host "   ❌ TESTE SSH: ERRO - $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "   ⏭️ Pulando $($vps.name)" -ForegroundColor Yellow
    }
    Write-Host ""
}

Write-Host "=== FINALIZACAO ===" -ForegroundColor Green
Write-Host ""
Write-Host "Apos configurar as VPS, execute:" -ForegroundColor Cyan
Write-Host "1. Atualize as VPS no FacePanel para usar 'Chave SSH'" -ForegroundColor White
Write-Host "2. Cole a chave privada nos formularios" -ForegroundColor White
Write-Host "3. Teste o botao 'Verificar Status'" -ForegroundColor White
Write-Host ""

Write-Host "CHAVE PRIVADA PARA O FACEPANEL:" -ForegroundColor Cyan
Get-Content "$env:USERPROFILE\.ssh\facepanel_key"
