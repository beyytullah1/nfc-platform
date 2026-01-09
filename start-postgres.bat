@echo off
echo 🐳 Docker PostgreSQL Başlatılıyor...
echo.

REM Docker çalışıyor mu kontrol et
docker ps >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Desktop çalışmıyor!
    echo 📌 Lütfen Docker Desktop'ı başlat ve tekrar dene.
    pause
    exit /b 1
)

echo ✅ Docker çalışıyor
echo.

REM PostgreSQL container'ını bul
echo 🔍 PostgreSQL container'ı aranıyor...
for /f "tokens=*" %%i in ('docker ps -a --filter "ancestor=postgres" --format "{{.ID}}"') do set CONTAINER_ID=%%i

if not defined CONTAINER_ID (
    echo ⚠️ PostgreSQL container'ı bulunamadı!
    echo.
    echo Tüm container'lar:
    docker ps -a
    pause
    exit /b 1
)

echo ✅ Container bulundu: %CONTAINER_ID%
echo.

REM Container'ı başlat
echo 🚀 Container başlatılıyor...
docker start %CONTAINER_ID%

if errorlevel 1 (
    echo ❌ Başlatma başarısız!
    pause
    exit /b 1
)

echo.
echo ✅ PostgreSQL başlatıldı!
echo 📊 Durum:
docker ps --filter "id=%CONTAINER_ID%"

echo.
echo 🎉 Veritabanı hazır!
echo.
pause
