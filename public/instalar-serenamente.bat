@echo off
chcp 65001 > nul
title Instalador SerenaMente

echo.
echo ========================================================
echo         Instalando SerenaMente na Area de Trabalho
echo ========================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell; " ^
  "$d = [Environment]::GetFolderPath('Desktop'); " ^
  "$s = $ws.CreateShortcut((Join-Path $d 'SerenaMente.lnk')); " ^
  "$edge = '%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe'; " ^
  "if (!(Test-Path $edge)) { $edge = '%ProgramFiles%\Microsoft\Edge\Application\msedge.exe' }; " ^
  "if (Test-Path $edge) { $s.TargetPath = $edge; $s.Arguments = '--app=http://localhost:3000/' } else { $s.TargetPath = 'http://localhost:3000/' }; " ^
  "$ico = Join-Path $env:LOCALAPPDATA 'SerenaMente\app-icon.ico'; " ^
  "if (Test-Path $ico) { $s.IconLocation = $ico + ',0' }; " ^
  "$s.Description = 'SerenaMente - Aplicativo Oficial'; " ^
  "$s.Save()"

echo [OK] Atalho com icone arredondado criado com sucesso na Area de Trabalho!
echo.
timeout /t 3 > nul
