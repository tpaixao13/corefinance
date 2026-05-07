# Script de inicialização do ambiente de desenvolvimento TDGenFin

Write-Host "=== TDGenFin - Iniciando ambiente de dev ===" -ForegroundColor Cyan

# Verifica se PostgreSQL está rodando
$pg = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue
if (-not $pg.TcpTestSucceeded) {
    Write-Warning "PostgreSQL não está rodando na porta 5432!"
    Write-Host "Execute uma das opções:" -ForegroundColor Yellow
    Write-Host "  Docker:  docker-compose up -d" -ForegroundColor White
    Write-Host "  Local:   Inicie o serviço PostgreSQL no Windows Services" -ForegroundColor White
    exit 1
}

Write-Host "PostgreSQL: OK" -ForegroundColor Green

# Inicia o servidor NestJS
Write-Host "Iniciando NestJS em modo desenvolvimento..." -ForegroundColor Cyan
Set-Location ".\backend"
npm run start:dev
