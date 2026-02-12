# Admin Authentication Setup

## Default Password

**Default Password:** `anova2024`

⚠️ **IMPORTANT**: Change this password before deploying to production!

## How to Change Password

### Option 1: Environment Variable (Recommended)

**Windows (PowerShell):**
```powershell
$env:ADMIN_PASSWORD = "your-secure-password-here"
python admin_server.py
```

**Windows (Command Prompt):**
```cmd
set ADMIN_PASSWORD=your-secure-password-here
python admin_server.py
```

**Linux/Mac:**
```bash
export ADMIN_PASSWORD="your-secure-password-here"
python admin_server.py
```

### Option 2: Edit Code (Not Recommended)

Edit `admin_server.py` line 30:
```python
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'your-new-password')
```

## How to Use

1. Start the server:
   ```
   python admin/admin_server.py
   ```

2. Visit: `http://localhost:8000/admin`

3. You'll be redirected to the login page

4. Enter the password

5. Access the admin panel

6. Click "🚪 Sair" in the top right to logout

## Security Notes

- Password is stored in memory only (not in database)
- Session expires when browser closes
- No "forgot password" feature (use environment variable)
- For multiple users, upgrade to user management system later

## Accessing Admin Panel

- **Login Page:** http://localhost:8000/admin/login
- **Admin Panel:** http://localhost:8000/admin (requires login)
- **Test Builder:** http://localhost:8000/admin/test-builder (requires login)

## What's Protected

All admin routes and API endpoints:
- `/admin` - Admin dashboard
- `/admin/test-builder` - Test creation tool
- `/api/tests` - All CRUD operations
- `/api/stats` - Statistics

## What's Public

User-facing pages remain public:
- `/` - Homepage
- `/catalogo.html` - Test catalog
- `/test.html` - Take tests
- `/dashboard.html` - View results
