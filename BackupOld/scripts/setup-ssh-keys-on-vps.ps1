# Script para Configurar Chaves SSH nas VPS
# Este script cria comandos para você executar em cada VPS

$PUBLIC_KEY = Get-Content "$env:USERPROFILE\.ssh\facepanel_key.pub"

$VPS_LIST = @(
    @{ name = "VPS1 fbrnews.co"; ip = "192.250.226.89"; password = "z5rlx5w6UVMvc2RW" },
    @{ name = "VPS2 fbrlite.xyz"; ip = "65.181.118.38"; password = "K5Q8ztpC51LsaYz9" },
    @{ name = "VPS3 vps.fbrnow"; ip = "65.181.118.37"; password = "4QNouZDC4ENJmnbs" }
)

Write-Host "🔑 Configuração de Chaves SSH nas VPS" -ForegroundColor Green
Write-Host ""

foreach ($vps in $VPS_LIST) {
    Write-Host "📡 $($vps.name) - $($vps.ip)" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "1. Conecte-se à VPS:" -ForegroundColor Yellow
    Write-Host "   ssh root@$($vps.ip)" -ForegroundColor White
    Write-Host "   Senha: $($vps.password)" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "2. Execute estes comandos NA VPS:" -ForegroundColor Yellow
    Write-Host "   mkdir -p ~/.ssh" -ForegroundColor White
    Write-Host "   chmod 700 ~/.ssh" -ForegroundColor White
    Write-Host ""
    
    Write-Host "3. Adicione a chave pública:" -ForegroundColor Yellow
    Write-Host "   echo `"$PUBLIC_KEY`" >> ~/.ssh/authorized_keys" -ForegroundColor White
    Write-Host ""
    
    Write-Host "4. Configure permissões:" -ForegroundColor Yellow
    Write-Host "   chmod 600 ~/.ssh/authorized_keys" -ForegroundColor White
    Write-Host ""
    
    Write-Host "5. Saia da VPS:" -ForegroundColor Yellow
    Write-Host "   exit" -ForegroundColor White
    Write-Host ""
    
    Write-Host "6. Teste a conexão (do seu PC):" -ForegroundColor Yellow
    Write-Host "   ssh -i `"$env:USERPROFILE\.ssh\facepanel_key`" root@$($vps.ip)" -ForegroundColor White
    Write-Host ""
    Write-Host "=" * 60 -ForegroundColor Gray
    Write-Host ""
}

Write-Host "✅ Após configurar todas as VPS, você poderá:" -ForegroundColor Green
Write-Host "   - Usar chaves SSH em vez de senhas" -ForegroundColor White
Write-Host "   - Cadastrar as VPS no FacePanel com a chave privada" -ForegroundColor White
Write-Host "   - Ter autenticação mais segura" -ForegroundColor White
