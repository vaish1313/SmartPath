# Authentication 400 Error Troubleshooting Guide

## 🔍 Problem
Getting **400 Bad Request** error when calling `/api/patients/profile`

---

## ✅ What I've Verified

### 1. **Frontend API Configuration** (`apps/web/lib/api.ts`)
✅ **CORRECT** - Token is being added to headers via interceptor:
```typescript
instance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("smartpath_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 2. **Backend Auth Middleware** (`services/patient-service/src/middleware/auth.middleware.js`)
✅ **CORRECT** - Returns 401 (not 400) for missing/invalid tokens:
```javascript
if (!authHeader || !authHeader.startsWith('Bearer ')) {
  return res.status(401).json({ message: 'No token provided' });
}
```

### 3. **Profile Controller** (`services/patient-service/src/controllers/patient.controller.js`)
✅ **CORRECT** - Returns 404 (not 400) for missing patient:
```javascript
const getProfile = async (req, res) => {
  const patient = await Patient.findById(req.user.id).select('-password');
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  res.status(200).json({ success: true, patient });
};
```

### 4. **JWT Token Generation** (`services/patient-service/src/controllers/auth.controller.js`)
✅ **CORRECT** - Token includes all required fields:
```javascript
const token = generateToken({
  id: patient._id,
  userId: patient._id,
  email: patient.email,
  role: patient.role,
  labId: 'prathamesh-nashik',
});
```

---

## 🎯 Possible Causes of 400 Error

### Cause 1: **Token Payload Missing `id` Field**
The `getProfile` controller uses `req.user.id`, but if the JWT payload doesn't have an `id` field, MongoDB will throw an error.

**Check:** The token generation includes `id: patient._id` ✅

### Cause 2: **Invalid ObjectId Format**
If `req.user.id` is not a valid MongoDB ObjectId, `Patient.findById()` will fail.

**Solution:** Add validation in the controller

### Cause 3: **Mongoose Validation Error**
If there's a schema validation issue, it returns 400.

**Check:** The error handler converts Mongoose validation errors to 400 ✅

### Cause 4: **CORS Preflight Failure**
If CORS is blocking the request, it might appear as 400.

**Check:** CORS is configured correctly ✅

### Cause 5: **Request Body Validation**
If there's unexpected validation middleware on the GET route.

**Check:** No validation middleware on GET /profile route ✅

---

## 🔧 Debugging Steps

### Step 1: Use the Debug Page
I've created a debug page at `/debug-auth` that will:
1. Show your current token and user info
2. Test the API directly with detailed error messages
3. Help identify the exact issue

**To use:**
```bash
# Visit in your browser
http://localhost:3000/debug-auth
```

### Step 2: Check Browser Console
1. Open DevTools (F12)
2. Go to Network tab
3. Try to access your profile
4. Click on the failed request
5. Check:
   - Request Headers → Is `Authorization: Bearer <token>` present?
   - Response → What's the exact error message?

### Step 3: Check Backend Logs
Look at your patient-service logs for the actual error:
```bash
# If running locally
cd services/patient-service
npm run dev

# Check the console output when the error occurs
```

### Step 4: Verify JWT Secret
Make sure the JWT_SECRET is the same in:
- `.env` (root)
- Patient service environment

**Current JWT_SECRET in .env:**
```
JWT_SECRET=smartpath-super-secret-jwt-key-2026
```

### Step 5: Test Token Manually
```bash
# Decode your JWT token at https://jwt.io
# Check if it has these fields:
{
  "id": "...",
  "userId": "...",
  "email": "...",
  "role": "...",
  "labId": "prathamesh-nashik"
}
```

---

## 🛠️ Quick Fixes

### Fix 1: Add ObjectId Validation
Update `services/patient-service/src/controllers/patient.controller.js`:

```javascript
const mongoose = require('mongoose');

const getProfile = async (req, res) => {
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid user ID format' 
    });
  }

  const patient = await Patient.findById(req.user.id).select('-password');
  if (!patient) {
    return res.status(404).json({ 
      success: false, 
      message: 'Patient not found' 
    });
  }
  
  res.status(200).json({ success: true, patient });
};
```

### Fix 2: Add Better Error Logging
Update the controller to log the actual error:

```javascript
const getProfile = async (req, res) => {
  try {
    console.log('Getting profile for user:', req.user);
    
    const patient = await Patient.findById(req.user.id).select('-password');
    
    if (!patient) {
      console.log('Patient not found:', req.user.id);
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }
    
    res.status(200).json({ success: true, patient });
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};
```

### Fix 3: Check if User Exists in Database
The user might have been deleted from the database but the token is still valid.

**Solution:** Re-seed the database or create a new user:
```bash
node scripts/seed-db.js
```

### Fix 4: Clear and Re-login
Sometimes the token gets corrupted in localStorage:

```javascript
// In browser console
localStorage.clear();
// Then login again
```

---

## 📋 Checklist

- [ ] Visit `/debug-auth` page and run tests
- [ ] Check browser Network tab for request headers
- [ ] Check backend logs for actual error
- [ ] Verify JWT_SECRET matches in all services
- [ ] Decode token at jwt.io to verify payload
- [ ] Check if user exists in database
- [ ] Try logging out and logging in again
- [ ] Clear localStorage and try again

---

## 🚨 Common Scenarios

### Scenario 1: "No token provided" (401)
**Cause:** Token not in localStorage or not being sent
**Fix:** Login again

### Scenario 2: "Invalid or expired token" (401)
**Cause:** Token expired or JWT_SECRET mismatch
**Fix:** Login again or check JWT_SECRET

### Scenario 3: "Patient not found" (404)
**Cause:** User deleted from database
**Fix:** Re-seed database or create user

### Scenario 4: "Validation failed" (400)
**Cause:** Invalid data format
**Fix:** Check the error.errors array for details

### Scenario 5: "Invalid user ID format" (400)
**Cause:** req.user.id is not a valid ObjectId
**Fix:** Check token payload structure

---

## 🔍 Next Steps

1. **Visit the debug page:** `http://localhost:3000/debug-auth`
2. **Run the API test** and check the error message
3. **Share the error details** from the debug page
4. **Check backend logs** for the actual error

---

## 📞 Need More Help?

If the debug page shows:
- **401 error:** Token issue → Login again
- **404 error:** User not in database → Re-seed or create user
- **400 error with message:** Share the exact error message
- **500 error:** Backend issue → Check backend logs

---

**Debug Page Created:** `apps/web/app/debug-auth/page.tsx`

Visit: `http://localhost:3000/debug-auth` (or `https://www.smart-path.co.in/debug-auth` in production)
