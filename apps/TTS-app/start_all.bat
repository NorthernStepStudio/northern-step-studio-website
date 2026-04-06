@echo off
title Neural Studio Launcher
color 0b

echo ===================================================
echo    NEURAL STUDIO - UNIFIED LAUNCHER
echo ===================================================
echo.
echo [1/3] Starting Backend API...
start "Neural Backend" cmd /k "cd /d %~dp0 && call venv\Scripts\activate && python -m uvicorn api.main:app --host 127.0.0.1 --port 8888 --reload"

timeout /t 5 /nobreak >nul

echo [2/4] Starting PC Desktop Launcher...
start "Desktop App" cmd /k "cd /d %~dp0\desktop && npm run build && npm run electron"

timeout /t 2 /nobreak >nul

echo [3/4] Starting Neural Tunnel...
start "Neural Tunnel" cmd /k "cd /d %~dp0 && npx localtunnel --port 8888 --subdomain neural-studio"

timeout /t 2 /nobreak >nul

echo [4/4] Starting Mobile App...
start "Mobile App" cmd /k "cd /d %~dp0\mobile && npx expo start --tunnel --clear"

echo.
echo ===================================================
echo    ALL SYSTEMS GO! 🚀
echo ===================================================
echo.
echo Keep this window open or minimize it.
echo.
pause
