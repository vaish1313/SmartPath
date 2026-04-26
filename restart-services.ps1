# PowerShell script to restart all services with OCR fix

Write-Host "🔧 SmartPath OCR Fix - Service Restart Script" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install backend dependencies
Write-Host "📦 Step 1: Installing backend dependencies..." -ForegroundColor Yellow
Set-Location services/patient-service
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Clear frontend cache
Write-Host "🗑️  Step 2: Clearing frontend cache..." -ForegroundColor Yellow
Set-Location ../../apps/web
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
Write-Host "✅ Frontend cache cleared" -ForegroundColor Green
Write-Host ""

# Step 3: Instructions
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Start Backend Service:" -ForegroundColor White
Write-Host "   cd services/patient-service" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start Frontend (in a new terminal):" -ForegroundColor White
Write-Host "   cd apps/web" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Open browser and hard refresh:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Gray
Write-Host "   Press Ctrl+Shift+R to hard refresh" -ForegroundColor Gray
Write-Host ""
Write-Host "🎯 The OCR feature should now work with OCR.space API!" -ForegroundColor Green
Write-Host ""

Set-Location ../..
