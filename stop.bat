@echo off
echo Stopping all running instances...
taskkill /f /im python.exe /fi "WINDOWTITLE eq Backend*" 2>nul
taskkill /f /im node.exe 2>nul
echo Done!
