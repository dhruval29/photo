@echo off
echo ========================================
echo Photo Flipbook - Vercel Deployment
echo ========================================
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Vercel CLI not found!
    echo.
    echo Please install it first:
    echo npm install -g vercel
    echo.
    pause
    exit /b 1
)

echo Checking image test...
echo Opening test-images.html to verify all images load correctly.
echo Please check that all images load successfully before continuing.
echo.
start test-images.html
echo.

choice /C YN /M "Have all images loaded successfully in the test page"
if errorlevel 2 (
    echo.
    echo Deployment cancelled. Please fix image loading issues first.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Starting deployment...
echo ========================================
echo.

REM Deploy to production
vercel --prod

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo Deployment successful!
    echo ========================================
    echo.
    echo Your flipbook should now be live at:
    echo https://photo-aus.vercel.app/
    echo.
    echo Next steps:
    echo 1. Test the live site in your browser
    echo 2. Check loading screen appears
    echo 3. Verify images load with progress
    echo 4. Test offline mode (DevTools ^> Network ^> Offline)
    echo.
) else (
    echo.
    echo [ERROR] Deployment failed!
    echo Please check the error messages above.
    echo.
)

pause
