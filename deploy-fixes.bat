@echo off
echo Deploying Kraft Gym fixes to Vercel...
cd /d "D:\web\gym-kraft-gym"
git add .
git commit -m "fix: crash guards for /trainers + /classes, emoji service icons, correct social link URLs"
git push
echo.
echo Done! Vercel will auto-deploy in ~60 seconds.
echo Check: https://www.kraftgym.fit
pause
