@echo off
echo =======================================================
echo Starting Robpaden Project (Frontend, Admin , Backend)...
echo =======================================================

echo Starting Backend...
start "Robpaden Backend" cmd /k "cd robpaden-backend && bun run dev"

echo Starting Frontend...
start "Robpaden Frontend" cmd /k "cd robpaden-frontend && bun run dev"

echo Starting Admin...
start "Robpaden Admin" cmd /k "cd robpaden-admin && bun run dev"

echo.
echo All services are launching in new command windows!
echo You can close this window now.
pause
