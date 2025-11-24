# 🚀 SCRIPT DE DEPLOYMENT AUTOMATIZADO

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  MUSEO DEL VALLENATO - DEPLOY" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Función para mostrar errores
function Show-Error {
    param($message)
    Write-Host "❌ ERROR: $message" -ForegroundColor Red
    exit 1
}

# Función para mostrar éxito
function Show-Success {
    param($message)
    Write-Host "✅ $message" -ForegroundColor Green
}

# Menú principal
Write-Host "Selecciona el tipo de deployment:" -ForegroundColor Yellow
Write-Host "1. Build Web (para Vercel)" -ForegroundColor White
Write-Host "2. Deploy a Vercel (directo)" -ForegroundColor White
Write-Host "3. Build APK (Android)" -ForegroundColor White
Write-Host "4. Setup completo (primera vez)" -ForegroundColor White
Write-Host "5. Salir" -ForegroundColor White
Write-Host ""

$option = Read-Host "Opción (1-5)"

switch ($option) {
    "1" {
        Write-Host "`n📦 Construyendo versión web..." -ForegroundColor Cyan
        
        # Verificar que existe .env
        if (-not (Test-Path ".env")) {
            Show-Error "No se encontró archivo .env. Por favor créalo con las credenciales de Supabase."
        }
        
        # Build web
        npm run build:web
        
        if ($LASTEXITCODE -eq 0) {
            Show-Success "Build web completado exitosamente!"
            Write-Host "`n📁 Los archivos están en: dist/" -ForegroundColor Yellow
            Write-Host "`n🚀 Para deployar en Vercel:" -ForegroundColor Yellow
            Write-Host "   1. Instalar Vercel CLI: npm install -g vercel" -ForegroundColor White
            Write-Host "   2. Login: vercel login" -ForegroundColor White
            Write-Host "   3. Deploy: vercel --prod" -ForegroundColor White
        } else {
            Show-Error "Falló el build web. Revisa los errores arriba."
        }
    }
    
    "2" {
        Write-Host "`n🚀 Deploying a Vercel..." -ForegroundColor Cyan
        
        # Verificar si Vercel CLI está instalado
        $vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
        if (-not $vercelInstalled) {
            Write-Host "⚠️  Vercel CLI no encontrado. Instalando..." -ForegroundColor Yellow
            npm install -g vercel
        }
        
        # Build primero
        Write-Host "`n📦 Building..." -ForegroundColor Cyan
        npm run build:web
        
        if ($LASTEXITCODE -ne 0) {
            Show-Error "Falló el build. No se puede deployar."
        }
        
        # Deploy
        Write-Host "`n☁️  Deploying a Vercel..." -ForegroundColor Cyan
        vercel --prod
        
        if ($LASTEXITCODE -eq 0) {
            Show-Success "Deployment exitoso!"
            Write-Host "`n⚠️  IMPORTANTE: Configura las variables de entorno en Vercel Dashboard:" -ForegroundColor Yellow
            Write-Host "   - EXPO_PUBLIC_SUPABASE_URL" -ForegroundColor White
            Write-Host "   - EXPO_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor White
        } else {
            Show-Error "Falló el deployment a Vercel."
        }
    }
    
    "3" {
        Write-Host "`n📱 Construyendo APK para Android..." -ForegroundColor Cyan
        
        # Verificar si EAS CLI está instalado
        $easInstalled = Get-Command eas -ErrorAction SilentlyContinue
        if (-not $easInstalled) {
            Write-Host "⚠️  EAS CLI no encontrado. Instalando..." -ForegroundColor Yellow
            npm install -g eas-cli
        }
        
        # Verificar login
        Write-Host "`n🔐 Verifica tu login en Expo..." -ForegroundColor Cyan
        $loggedIn = eas whoami
        
        if (-not $loggedIn) {
            Write-Host "⚠️  No estás logueado. Por favor inicia sesión:" -ForegroundColor Yellow
            eas login
        }
        
        # Build APK
        Write-Host "`n🏗️  Iniciando build de APK (esto puede tardar 10-20 minutos)..." -ForegroundColor Cyan
        Write-Host "💡 Puedes cerrar esta ventana. El build continuará en los servidores de Expo." -ForegroundColor Yellow
        Write-Host "📊 Ver progreso en: https://expo.dev" -ForegroundColor Yellow
        Write-Host ""
        
        eas build --platform android --profile production
        
        if ($LASTEXITCODE -eq 0) {
            Show-Success "Build iniciado exitosamente!"
            Write-Host "`n📥 El APK se descargará automáticamente cuando termine." -ForegroundColor Yellow
            Write-Host "📱 También puedes descargarlo desde: https://expo.dev" -ForegroundColor Yellow
        } else {
            Show-Error "Falló al iniciar el build del APK."
        }
    }
    
    "4" {
        Write-Host "`n⚙️  Setup completo..." -ForegroundColor Cyan
        
        # Instalar dependencias
        Write-Host "`n📦 Instalando dependencias..." -ForegroundColor Cyan
        npm install
        
        # Instalar CLIs globales
        Write-Host "`n🛠️  Instalando herramientas globales..." -ForegroundColor Cyan
        npm install -g eas-cli vercel
        
        # Verificar assets
        Write-Host "`n🎨 Verificando assets..." -ForegroundColor Cyan
        if (-not (Test-Path "assets/icon.png")) {
            Write-Host "⚠️  Creando iconos desde logo..." -ForegroundColor Yellow
            Copy-Item "assets/logo.png" "assets/icon.png" -Force
            Copy-Item "assets/logo.png" "assets/adaptive-icon.png" -Force
            Copy-Item "assets/logo.png" "assets/splash.png" -Force
            Copy-Item "assets/logo.png" "assets/favicon.png" -Force
        }
        
        # Verificar .env
        Write-Host "`n🔐 Verificando configuración..." -ForegroundColor Cyan
        if (-not (Test-Path ".env")) {
            Write-Host "⚠️  IMPORTANTE: Crea un archivo .env con:" -ForegroundColor Yellow
            Write-Host "   EXPO_PUBLIC_SUPABASE_URL=https://..." -ForegroundColor White
            Write-Host "   EXPO_PUBLIC_SUPABASE_ANON_KEY=..." -ForegroundColor White
        }
        
        # Login en servicios
        Write-Host "`n🔑 Configurando servicios..." -ForegroundColor Cyan
        Write-Host "1. Login en Expo:" -ForegroundColor Yellow
        eas login
        
        Write-Host "`n2. Login en Vercel:" -ForegroundColor Yellow
        vercel login
        
        Show-Success "Setup completado!"
        Write-Host "`n📝 Próximos pasos:" -ForegroundColor Yellow
        Write-Host "   1. Crear archivo .env si no existe" -ForegroundColor White
        Write-Host "   2. Ejecutar SQL en Supabase (supabase_policies.sql)" -ForegroundColor White
        Write-Host "   3. Ejecutar este script nuevamente y elegir opción 2 o 3" -ForegroundColor White
    }
    
    "5" {
        Write-Host "`n👋 ¡Hasta luego!" -ForegroundColor Cyan
        exit 0
    }
    
    default {
        Show-Error "Opción inválida. Por favor selecciona 1-5."
    }
}

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT COMPLETADO" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
