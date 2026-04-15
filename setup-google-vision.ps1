# SmartPath - Google Cloud Vision OCR Setup Script (PowerShell)
# This script helps set up Google Cloud Vision API for prescription OCR

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "SmartPath - Google Vision OCR Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running from project root
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Running from project root" -ForegroundColor Green
Write-Host ""

# Step 1: Check for API key
Write-Host "Step 1: Checking for Google Vision API key..." -ForegroundColor Yellow

$envFileExists = Test-Path ".env"
$apiKeyInEnv = $false
if ($envFileExists) {
    $envContent = Get-Content ".env" -Raw
    $apiKeyInEnv = $envContent -match "GOOGLE_VISION_API_KEY=AIza"
}

if ($apiKeyInEnv) {
    Write-Host "✅ Google Vision API key found in .env" -ForegroundColor Green
} else {
    Write-Host "⚠️  Google Vision API key not found in .env" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please follow these steps:"
    Write-Host "1. Go to https://console.cloud.google.com/"
    Write-Host "2. Create/select a project"
    Write-Host "3. Enable Cloud Vision API"
    Write-Host "4. Create an API key"
    Write-Host "5. Add to .env file:"
    Write-Host "   GOOGLE_VISION_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    Write-Host ""
    Read-Host "Press Enter after adding the API key to .env"
}

$webEnvExists = Test-Path "apps/web/.env.local"
$apiKeyInWebEnv = $false
if ($webEnvExists) {
    $webEnvContent = Get-Content "apps/web/.env.local" -Raw
    $apiKeyInWebEnv = $webEnvContent -match "NEXT_PUBLIC_GOOGLE_VISION_API_KEY=AIza"
}

if ($apiKeyInWebEnv) {
    Write-Host "✅ Google Vision API key found in apps/web/.env.local" -ForegroundColor Green
} else {
    Write-Host "⚠️  Google Vision API key not found in apps/web/.env.local" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please add to apps/web/.env.local:"
    Write-Host "NEXT_PUBLIC_GOOGLE_VISION_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    Write-Host ""
    Read-Host "Press Enter after adding the API key to apps/web/.env.local"
}

Write-Host ""

# Step 2: Install dependencies
Write-Host "Step 2: Installing dependencies..." -ForegroundColor Yellow
Set-Location "services/patient-service"
try {
    npm install axios multer
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    Set-Location "../.."
    exit 1
}
Set-Location "../.."
Write-Host ""

# Step 3: Create uploads directory
Write-Host "Step 3: Creating uploads directory..." -ForegroundColor Yellow
$uploadsDir = "services/patient-service/uploads/prescriptions"
if (-not (Test-Path $uploadsDir)) {
    New-Item -ItemType Directory -Path $uploadsDir -Force | Out-Null
}
Write-Host "✅ Uploads directory created" -ForegroundColor Green
Write-Host ""

# Step 4: Verify files exist
Write-Host "Step 4: Verifying required files..." -ForegroundColor Yellow
$files = @(
    "services/patient-service/src/services/ocrService.js",
    "services/patient-service/src/controllers/prescriptionController.js",
    "services/patient-service/src/routes/prescriptionRoutes.js",
    "services/patient-service/src/models/Prescription.js"
)

$allExist = $true
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file (missing)" -ForegroundColor Red
        $allExist = $false
    }
}

if (-not $allExist) {
    Write-Host ""
    Write-Host "⚠️  Some required files are missing. Please ensure all files are created." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 5: Test API key
Write-Host "Step 5: Testing Google Vision API key..." -ForegroundColor Yellow
Write-Host "This will make a test API call to verify your key works."
$testApi = Read-Host "Do you want to test the API key now? (y/n)"

if ($testApi -eq "y" -or $testApi -eq "Y") {
    # Extract API key from .env
    $envContent = Get-Content ".env" -Raw
    $apiKeyMatch = [regex]::Match($envContent, "GOOGLE_VISION_API_KEY=(.+)")
    
    if ($apiKeyMatch.Success) {
        $apiKey = $apiKeyMatch.Groups[1].Value.Trim()
        Write-Host "Testing API key..." -ForegroundColor Yellow
        
        # Create a simple test image (1x1 white pixel)
        $testImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
        
        $body = @{
            requests = @(
                @{
                    image = @{
                        content = $testImage
                    }
                    features = @(
                        @{
                            type = "DOCUMENT_TEXT_DETECTION"
                            maxResults = 1
                        }
                    )
                }
            )
        } | ConvertTo-Json -Depth 10
        
        try {
            $response = Invoke-RestMethod -Uri "https://vision.googleapis.com/v1/images:annotate?key=$apiKey" `
                -Method Post `
                -ContentType "application/json" `
                -Body $body
            
            if ($response.responses[0].error) {
                Write-Host "❌ API key test failed" -ForegroundColor Red
                Write-Host "Error: $($response.responses[0].error.message)" -ForegroundColor Red
            } else {
                Write-Host "✅ API key is valid and working!" -ForegroundColor Green
            }
        } catch {
            Write-Host "❌ API key test failed" -ForegroundColor Red
            Write-Host "Error: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Could not extract API key from .env" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Start the services: npm run dev"
Write-Host "2. Go to http://localhost:3000/book-test"
Write-Host "3. Upload a prescription and test OCR"
Write-Host ""
Write-Host "Documentation:"
Write-Host "- GOOGLE_VISION_OCR_GUIDE.md - Complete guide"
Write-Host "- MIGRATION_ANTHROPIC_TO_GOOGLE.md - Migration details"
Write-Host "- TESTING_PRESCRIPTION_OCR.md - Testing guide"
Write-Host ""
Write-Host "Support: hello@padc.in"
Write-Host ""
