@echo off
title NFC Platform - Veritabani Onarim
color 0E

echo ========================================================
echo   NFC PLATFORM VERITABANI SIFIRLANIYOR
echo ========================================================
echo.
echo [!] BU ISLEM MEVCUT VERITABANI KONTEYNERINI SILECEK VE
echo     YENIDEN KURACAKTIR.
echo.
echo Lutfen .env dosyasini kontrol ettiginizden emin olun:
echo Sifre: postgres
echo.
timeout /t 5

echo.
echo [1/5] Eski konteyner temizleniyor...
docker rm -f nfc-postgres >nul 2>&1

echo.
echo [2/5] Yeni veritabani baslatiliyor...
docker run -d --name nfc-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=nfc_platform -p 5432:5432 postgres:15

echo.
echo [3/5] Veritabaninin hazirlanmasi bekleniyor (15 sn)...
timeout /t 15 /nobreak >nul

echo.
echo [4/5] Tablolar olusturuluyor (Schema Push)...
call npx prisma db push --skip-generate
if errorlevel 1 (
    color 0C
    echo.
    echo [HATALI] Veritabanina baglanilamadi!
    echo Lutfen .env dosyasindaki sifrenin 'postgres' oldugundan emin olun.
    pause
    exit
)

echo.
echo [5/5] Demo veriler yukleniyor...
call node prisma/seed-demo.js
call node prisma/set-admin-role.js

echo.
echo ========================================================
echo   ISLEM BASARILI!
echo ========================================================
echo.
echo Veritabani sifirlandi, tablolar kuruldu ve admin kullanicisi acildi.
echo.
echo Giris Bilgileri:
echo Email: demo@nfc.com  / Sifre: 123
echo Email: admin@nfc.com / Sifre: 123
echo.
pause
