@echo off
echo =======================================================
echo Starting Robpaden Project (Frontend, Admin , Backend)...
echo =======================================================

echo Starting Backend...
start "Robpaden Backend" cmd /k "cd backend && bun run dev"

echo Starting Frontend...
start "Robpaden Office Dashboard" cmd /k "cd office-dashboard && bun run dev"

echo Starting Admin...
start "Robpaden Admin Dashboard" cmd /k "cd admin-dashboard && bun run dev"

echo Starting Tv Screen...
start "Robpaden Tv Screen" cmd /k "cd tv-screen && bun run dev"

echo.
echo All services are launching in new command windows!
echo You can close this window now.
pause
