# 🔧 Fix OCR Issue - Environment Variable Not Loading

## ❌ Problem

The browser console shows:
```
vision.googleapis.com/v1/images:annotate?key=your_google_vision_api_key_here:1
Failed to load resource: the server responded with a status of 400
```

This means:
1. The old Google Vision API code is still running
2. The environment variable `NEXT_PUBLIC_OCR_API_KEY` is not being loaded
3. The Next.js build cache needs to be cleared

---

## ✅ Solution

### Step 1: Stop the Development Server

Press `Ctrl + C` in your terminal to stop the running Next.js server.

### Step 2: Clear Next.js Cache

Run these commands:

```bash
# Navigate to the web app directory
cd apps/web

# Delete the .next build folder
rm -rf .next

# On Windows PowerShell, use:
Remove-Item -Recurse -Force .next

# Also clear node_modules/.cache if it exists
rm -rf node_modules/.cache

# On Windows PowerShell:
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
```

### Step 3: Verify Environment Variables

Make sure `apps/web/.env.local` contains:

```env
NEXT_PUBLIC_OCR_API_KEY=K84480557488957
```

**IMPORTANT:** The variable name changed from:
- ❌ OLD: `NEXT_PUBLIC_GOOGLE_VISION_API_KEY`
- ✅ NEW: `NEXT_PUBLIC_OCR_API_KEY`

### Step 4: Restart Development Server

```bash
# From the web app directory
npm run dev

# Or from the root directory
npm run dev --workspace=web
```

### Step 5: Hard Refresh Browser

After the server restarts:
1. Open your browser
2. Press `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
3. This clears the browser cache and reloads

---

## 🔍 Verification

After restarting, check the browser console:
- ✅ Should see: `https://api.ocr.space/parse/image` (OCR.space API)
- ❌ Should NOT see: `vision.googleapis.com` (Google Vision API)

---

## 🚨 If Still Not Working

### Check 1: Environment Variable is Loaded

Add this temporary debug line to `apps/web/app/(patient)/book-test/page.tsx`:

```typescript
// Add this inside the scanPrescription function, before the API call
console.log('OCR API Key:', process.env.NEXT_PUBLIC_OCR_API_KEY);
```

Expected output in console:
```
OCR API Key: K84480557488957
```

If it shows `undefined`, the environment variable is not being loaded.

### Check 2: Restart Computer (Last Resort)

Sometimes environment variables require a full system restart to be recognized.

---

## 📝 Quick Fix Commands (Copy-Paste)

### For Windows PowerShell:

```powershell
# Stop server (Ctrl+C), then run:
cd apps/web
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
npm run dev
```

### For Mac/Linux:

```bash
# Stop server (Ctrl+C), then run:
cd apps/web
rm -rf .next node_modules/.cache
npm run dev
```

---

## ✅ Expected Result

After following these steps:
1. ✅ No more Google Vision API errors
2. ✅ OCR.space API is being called
3. ✅ Prescription scanning works
4. ✅ No 400 errors in console

---

## 🎯 Root Cause

Next.js caches environment variables during build time. When you change environment variables, you must:
1. Delete the `.next` folder
2. Restart the development server
3. Hard refresh the browser

This ensures the new environment variables are loaded.
