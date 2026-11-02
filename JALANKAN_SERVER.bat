@echo off
title Server E-Commerce Juleha Jawa Timur (Localhost)
color 0B
cd /d "%~dp0"

cls
echo =======================================================================
echo          SERVER RESMI E-COMMERCE JULEHA JAWA TIMUR (LOCAL)
echo =======================================================================
echo.
echo   Memeriksa ketersediaan PHP dan Database MySQL...
echo.

:: 1. Deteksi PHP (Laragon atau System PATH)
set "PHP_BIN=php"
if exist "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" (
    set "PHP_BIN=C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe"
) else if exist "C:\laragon\bin\php\php-8.2.0-Win32-vs16-x64\php.exe" (
    set "PHP_BIN=C:\laragon\bin\php\php-8.2.0-Win32-vs16-x64\php.exe"
)

echo   [+] Menggunakan PHP: %PHP_BIN%
echo.
echo -----------------------------------------------------------------------
echo   ALAMAT WEBSITE : http://localhost:8000  atau  http://127.0.0.1:8000
echo   STATUS         : SERVER SEDANG AKTIF
echo -----------------------------------------------------------------------
echo.
echo   [CATATAN PENTING]
echo   1. Pastikan Laragon sudah menyala (Klik 'Start All' di Laragon).
echo   2. Jangan tutup jendela hitam ini selama Anda menggunakan website.
echo   3. Untuk mematikan server: Tekan Ctrl + C lalu ketik Y, atau tutup jendela ini.
echo.
echo =======================================================================
echo.
echo   Membuka website di browser...
start "" "http://127.0.0.1:8000"

echo   Menjalankan server Laravel...
echo.
%PHP_BIN% artisan serve --host=127.0.0.1 --port=8000

echo.
echo Server telah dimatikan.
pause

