# Setup do banco de dados TDGenFin
# Executa as migrations no PostgreSQL local (após instalação)

param(
    [string]$Host = "localhost",
    [string]$Port = "5432",
    [string]$User = "postgres",
    [string]$Password = "postgres",
    [string]$Database = "tdgenfin"
)

$env:PGPASSWORD = $Password

$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    # Tenta caminhos padrão do PostgreSQL no Windows
    $candidates = @(
        "C:\Program Files\PostgreSQL\16\bin\psql.exe",
        "C:\Program Files\PostgreSQL\17\bin\psql.exe",
        "C:\Program Files\PostgreSQL\15\bin\psql.exe"
    )
    foreach ($c in $candidates) {
        if (Test-Path $c) { $psqlPath = $c; break }
    }
}

if (-not $psqlPath) {
    Write-Error "psql não encontrado. Verifique se o PostgreSQL foi instalado corretamente."
    exit 1
}

$psql = if ($psqlPath -is [string]) { $psqlPath } else { $psqlPath.Source }

Write-Host "Usando psql: $psql" -ForegroundColor Cyan

# Cria o banco se não existir
Write-Host "Criando banco de dados '$Database'..." -ForegroundColor Yellow
& $psql -h $Host -p $Port -U $User -c "CREATE DATABASE $Database;" 2>&1 | Out-Null

# Executa migration de schema
Write-Host "Executando schema (001)..." -ForegroundColor Yellow
& $psql -h $Host -p $Port -U $User -d $Database -f ".\backend\src\database\migrations\001_initial_schema.sql"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha ao executar migration 001."
    exit 1
}

# Executa seed
Write-Host "Executando seed (002)..." -ForegroundColor Yellow
& $psql -h $Host -p $Port -U $User -d $Database -f ".\backend\src\database\migrations\002_seed.sql"

Write-Host "`nBanco configurado com sucesso!" -ForegroundColor Green
Write-Host "Credenciais de acesso:" -ForegroundColor Cyan
Write-Host "  SUPER_ADMIN:   admin@tdgenfin.com / Admin@123"
Write-Host "  ADMIN_EMPRESA: admin@empresa-demo.com / Admin@123"
