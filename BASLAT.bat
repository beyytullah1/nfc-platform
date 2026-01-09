@echo off
title NFC Platform Baslatici
color 0A

echo ========================================================
echo   NFC PLATFORM BASLATILIYOR...
echo ========================================================
echo.

:: 1. Docker Kontrolü
echo [1/3] Docker kontrol ediliyor...
docker ps >nul 2>&1
if errorlevel 1 (
    echo [!] Docker Desktop calismiyor. Lutfen Docker'i baslatip tekrar deneyin.
    pause
    exit
)
echo [OK] Docker calisiyor.

:: 2. Veritabanı Başlatma
echo.
echo [2/3] Veritabani (PostgreSQL) baslatiliyor...
docker start nfc-postgres >nul 2>&1
if errorlevel 1 (
    echo [!] Konteyner baslatilamadi veya ismi yanlis.
    echo     Yeni bir konteyner olusturuluyor...
    docker run -d --name nfc-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=nfc_platform -p 5432:5432 postgres:15
    echo [OK] Yeni veritabani olusturuldu.
    echo [i] Lutfen biraz bekleyin ve 'npx prisma db push' komutunu elle calistirin.
) else (
    echo [OK] Veritabani basariyla baslatildi.
)

:: 3. Projeyi Başlatma
echo.
echo [3/3] Next.js sunucusu baslatiliyor...
echo.
echo     Giris Linki: http://localhost:3000
echo.
echo ========================================================
echo   ARTIK CALISABILIRSINIZ! (Kapatmak icin CTRL+C)
echo ========================================================
echo.

call npm run dev
