@echo off
echo Creating project directory structure...

mkdir src\types 2>nul
mkdir src\engine 2>nul
mkdir src\store 2>nul
mkdir src\utils 2>nul
mkdir src\components\SetupScreen 2>nul
mkdir src\components\VisualizationScreen 2>nul
mkdir public 2>nul

echo Installing all dependencies (including Biome)...
call npm install

echo.
echo Setup complete!
echo Run "npm run dev" to start the app.
echo Run "npm run format" to format with Biome.
echo Run "npm run lint" to lint with Biome.
pause
