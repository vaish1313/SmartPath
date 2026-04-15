#!/bin/bash

# SmartPath - Google Cloud Vision OCR Setup Script
# This script helps set up Google Cloud Vision API for prescription OCR

echo "=========================================="
echo "SmartPath - Google Vision OCR Setup"
echo "=========================================="
echo ""

# Check if running from project root
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Running from project root"
echo ""

# Step 1: Check for API key
echo "Step 1: Checking for Google Vision API key..."
if grep -q "GOOGLE_VISION_API_KEY=AIza" .env 2>/dev/null; then
    echo "✅ Google Vision API key found in .env"
else
    echo "⚠️  Google Vision API key not found in .env"
    echo ""
    echo "Please follow these steps:"
    echo "1. Go to https://console.cloud.google.com/"
    echo "2. Create/select a project"
    echo "3. Enable Cloud Vision API"
    echo "4. Create an API key"
    echo "5. Add to .env file:"
    echo "   GOOGLE_VISION_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    echo ""
    read -p "Press Enter after adding the API key to .env..."
fi

if grep -q "NEXT_PUBLIC_GOOGLE_VISION_API_KEY=AIza" apps/web/.env.local 2>/dev/null; then
    echo "✅ Google Vision API key found in apps/web/.env.local"
else
    echo "⚠️  Google Vision API key not found in apps/web/.env.local"
    echo ""
    echo "Please add to apps/web/.env.local:"
    echo "NEXT_PUBLIC_GOOGLE_VISION_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    echo ""
    read -p "Press Enter after adding the API key to apps/web/.env.local..."
fi

echo ""

# Step 2: Install dependencies
echo "Step 2: Installing dependencies..."
cd services/patient-service
if npm install axios multer; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
cd ../..
echo ""

# Step 3: Create uploads directory
echo "Step 3: Creating uploads directory..."
mkdir -p services/patient-service/uploads/prescriptions
echo "✅ Uploads directory created"
echo ""

# Step 4: Verify files exist
echo "Step 4: Verifying required files..."
files=(
    "services/patient-service/src/services/ocrService.js"
    "services/patient-service/src/controllers/prescriptionController.js"
    "services/patient-service/src/routes/prescriptionRoutes.js"
    "services/patient-service/src/models/Prescription.js"
)

all_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
        all_exist=false
    fi
done

if [ "$all_exist" = false ]; then
    echo ""
    echo "⚠️  Some required files are missing. Please ensure all files are created."
    exit 1
fi

echo ""

# Step 5: Test API key
echo "Step 5: Testing Google Vision API key..."
echo "This will make a test API call to verify your key works."
read -p "Do you want to test the API key now? (y/n): " test_api

if [ "$test_api" = "y" ] || [ "$test_api" = "Y" ]; then
    # Extract API key from .env
    api_key=$(grep "GOOGLE_VISION_API_KEY=" .env | cut -d '=' -f2)
    
    if [ -z "$api_key" ]; then
        echo "❌ Could not extract API key from .env"
    else
        echo "Testing API key..."
        # Create a simple test image (1x1 white pixel)
        test_image="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
        
        response=$(curl -s -X POST \
            "https://vision.googleapis.com/v1/images:annotate?key=$api_key" \
            -H "Content-Type: application/json" \
            -d "{
                \"requests\": [{
                    \"image\": {\"content\": \"$test_image\"},
                    \"features\": [{\"type\": \"DOCUMENT_TEXT_DETECTION\", \"maxResults\": 1}]
                }]
            }")
        
        if echo "$response" | grep -q "error"; then
            echo "❌ API key test failed"
            echo "Response: $response"
        else
            echo "✅ API key is valid and working!"
        fi
    fi
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Start the services: npm run dev"
echo "2. Go to http://localhost:3000/book-test"
echo "3. Upload a prescription and test OCR"
echo ""
echo "Documentation:"
echo "- GOOGLE_VISION_OCR_GUIDE.md - Complete guide"
echo "- MIGRATION_ANTHROPIC_TO_GOOGLE.md - Migration details"
echo "- TESTING_PRESCRIPTION_OCR.md - Testing guide"
echo ""
echo "Support: hello@padc.in"
echo ""
