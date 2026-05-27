@echo off
title FIFA World Cup Manager - UCL Jukebox
echo ========================================================
echo   KHOI DONG TOURNAMENT MANAGER + YOUTUBE JUKEBOX
echo ========================================================
echo.

cd /d "%~dp0"

:: Check if Node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js chua duoc cai dat! Vui long cai dat Node.js tai https://nodejs.org/
    pause
    exit /b
)

:: Check if Python is installed (required for yt-dlp)
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python chua duoc cai dat! Vui long cai dat Python de tai nhac tu YouTube.
    pause
    exit /b
)

:: Install packages if node_modules missing
if not exist node_modules (
    echo [INFO] Dang cai dat cac thu vien con thieu...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Cai dat thu vien that bai.
        pause
        exit /b
    )
)

echo [INFO] Dang khoi dong May chu Jukebox (Port 3000) chay ngam...
:: Start server.cjs concurrently in the background
start /b node server.cjs

echo [INFO] Dang khoi dong Trinh phat World Cup Manager (Vite dev)...
echo.
:: Open Vite in this window
call npm run dev

pause
