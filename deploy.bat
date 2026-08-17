@echo off
echo =======================================================
echo     Building and Pushing All Docker Images
echo =======================================================
echo.

echo [1/3] Processing Backend...
cd dremarr-backend
docker build -t sabbirmridha/dreamer-backend:latest .
docker push sabbirmridha/dreamer-backend:latest
cd ..
echo Backend processed successfully!
echo.

echo [2/3] Processing Frontend...
cd dremarr-frontend
docker build -t sabbirmridha/dreamer-frontend:latest .
docker push sabbirmridha/dreamer-frontend:latest
cd ..
echo Frontend processed successfully!
echo.

echo [3/3] Processing Admin...
cd dreamer-admin
docker build -t sabbirmridha/dreamer-admin:latest .
docker push sabbirmridha/dreamer-admin:latest
cd ..
echo Admin processed successfully!
echo.

echo =======================================================
echo All 3 services have been successfully built and pushed!
echo You can now go to Dockploy and hit "Deploy/Restart" 
echo for your services to pull these latest images.
echo =======================================================
pause
