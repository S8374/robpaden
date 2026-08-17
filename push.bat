@echo off
echo =========================================
echo   Push Code to GitHub
echo =========================================
@echo off
set /p msg="Enter your commit message (or press Enter for default): "
if "%msg%"=="" set msg="Update project files"

echo.
echo =========================================
echo   Pushing Backend (dremarr-backend)
echo =========================================
cd dremarr-backend
git add .
git commit -m "%msg%"
git push
cd ..

echo.
echo =========================================
echo   Pushing Admin (dreamer-admin)
echo =========================================
cd dreamer-admin
git add .
git commit -m "%msg%"
git push
cd ..

echo.
echo =========================================
echo   Pushing Frontend (dremarr-frontend)
echo =========================================
cd dremarr-frontend
git add .
git commit -m "%msg%"
git push
cd ..

echo.
echo =========================================
echo   Successfully pushed all repositories!
echo =========================================
pause