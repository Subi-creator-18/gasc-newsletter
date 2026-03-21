 vc# GASC Dynamic E-Newsletter — Complete Setup Guide
   
## STEP 1: Prerequisites (Install These First)

### 1.1 Install Node.js (v18 or above)
- Go to: https://nodejs.org/
- Download **LTS version** and install
- Verify: open terminal → type `node -v` → should show v18.x.x

C:\Users\Faster>node -v
v24.14.0

### 1.2 Install Git (optional but recommended)
- Go to: https://git-scm.com/downloads

---

## STEP 2: Free Cloud Accounts (Sign Up Before Starting)

### 2.1 MongoDB Atlas (Free Database)
1. Go to: https://www.mongodb.com/atlas
2. Sign up free → Create project "gasc-newsletter"
username
gasc_admin
password
admin@1810
3. Create a FREE cluster (M0 Sandbox)
4. Under **Security > Database Access** → Add user: `gasc_admin` / your password
5. Under **Security > Network Access** → Add IP: `0.0.0.0/0` (allow all)
6. Click **Connect** → **Drivers** → Copy the connection string
   - Looks like: `mongodb+srv://gasc_admin:<password>@cluster0.xxxxx.mongodb.net/gasc_newsletter`
   Connection string 
   mongodb://gasc_admin:admin@1810@ac-uzxvaku-shard-00-00.a5h6sp3.mongodb.net:27017,ac-uzxvaku-shard-00-01.a5h6sp3.mongodb.net:27017,ac-uzxvaku-shard-00-02.a5h6sp3.mongodb.net:27017/?ssl=true&replicaSet=atlas-veqb67-shard-0&authSource=admin&appName=gasc-newsletter
7. Save this string — you'll need it in Step 4

### 2.2 Cloudinary (Free Image Storage)
1. Go to: https://cloudinary.com/
2. Sign up free
3. Go to **Dashboard** → Copy:
   - Cloud Name
   - API Key
   - API Secret

   Cloud name: dhhmpnobn
   api key: 543884585182792
   api secret: RbrkV-vi5ttFxgi4J3gHMPPuMv8
4. Save these — you'll need them in Step 4

---

## STEP 3: Project Setup

### 3.1 Open Terminal / Command Prompt
- Windows: Press `Win+R` → type `cmd` → Enter
- Mac: Press `Cmd+Space` → type `terminal` → Enter

### 3.2 Navigate to Project Folder
```bash
# Example: if project is in Downloads folder
cd Downloads/gasc-newsletter

# Or wherever you extracted the zip:
cd path/to/gasc-newsletter
```

### 3.3 Install Backend Dependencies
```bash
cd backend
npm install
```
This installs all packages listed in package.json automatically.

---

## STEP 4: Configure Environment Variables

### 4.1 Create the .env file
Inside the `backend/` folder, create a file named exactly `.env`

```
PORT=5000
MONGODB_URI=mongodb://gasc_admin:admin@1810@ac-uzxvaku-shard-00-00.a5h6sp3.mongodb.net:27017,ac-uzxvaku-shard-00-01.a5h6sp3.mongodb.net:27017,ac-uzxvaku-shard-00-02.a5h6sp3.mongodb.net:27017/?ssl=true&replicaSet=atlas-veqb67-shard-0&authSource=admin&appName=gasc-newsletter
JWT_SECRET=09ccd0916381f3e27f206292b6bb977150779320df5deea94d32beefd53e70c8d338c24049051c4b66dfc5be9abf674cf1c10f3c6a3f101ff3f6653ae6519900
JWT_REFRESH_SECRET=7dce03eebf65bcde43c2ef3688222c88edbd323d65b8327f98730efb7f293945d42fa958bef9fe3ceec4b3ebf1a22554f919f192038c4f472a7b59a89fe7c266
CLOUDINARY_CLOUD_NAME=dhhmpnobn
CLOUDINARY_API_KEY=543884585182792
CLOUDINARY_API_SECRET=RbrkV-vi5ttFxgi4J3gHMPPuMv8

FRONTEND_URL=http://127.0.0.1:5500
NODE_ENV=development
```

Replace the values with your actual credentials from Step 2.

---

## STEP 5: Seed Initial Data

```bash
# Still inside backend/ folder
node utils/seed.js

C:\Users\Faster\Documents\gasc-newsletter\gasc-newsletter\backend>node utils/seed.js
ENV: mongodb://gasc_admin:admin%401810@ac-uzxvaku-shard-00-00.a5h6sp3.mongodb.net:27017,ac-uzxvaku-shard-00-01.a5h6sp3.mongodb.net:27017,ac-uzxvaku-shard-00-02.a5h6sp3.mongodb.net:27017/?ssl=true&replicaSet=atlas-veqb67-shard-0&authSource=admin&appName=gasc-newsletter
✅ Connected to MongoDB
🧹 Cleared existing data
✅ Created 29 departments
✅ Created principal account: principal@gasc.edu / Principal@123
✅ Created 13 staff accounts (password: Staff@123)
✅ Created college info

🎉 Seed complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Principal: principal@gasc.edu / Principal@123
Staff:     cs.staff@gasc.edu  / Staff@123
Staff:     tamil.staff@gasc.edu / Staff@123
(All staff password: Staff@123)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

This will create:
- All departments (aided, unaided, forums)
- Default college info
- One principal account: principal@gasc.edu / Principal@123
- Sample staff accounts per department

---

## STEP 6: Start the Backend Server

```bash
# Inside backend/ folder
npm run dev
```

You should see:
```
✅ MongoDB Connected
🚀 GASC Newsletter Server running on port 5000
```

---

## STEP 7: Open the Frontend

### Option A: VS Code Live Server (Recommended)
1. Install VS Code: https://code.visualstudio.com/
2. Install extension: **Live Server** (by Ritwick Dey)
3. Right-click `frontend/index.html` → **Open with Live Server**
4. Browser opens at `http://127.0.0.1:5500`

### Option B: Direct File Open
- Simply double-click `frontend/index.html` in your file explorer
- Note: Some features may need Live Server due to CORS

---

## STEP 8: Login & Test

### Principal Account
- Email: `principal@gasc.edu`
- Password: `Principal@123`

### Sample Staff Accounts (created by seed)
- Email: `cs.staff@gasc.edu` / Password: `Staff@123`  (Computer Science)
- Email: `math.staff@gasc.edu` / Password: `Staff@123`  (Mathematics)
- Email: `tamil.staff@gasc.edu` / Password: `Staff@123`  (Tamil)

---

## STEP 9: Deploy to Free Hosting

### 9.1 Deploy Backend to Render.com
1. Go to: https://render.com/ → Sign up free
2. New → **Web Service** → Connect your GitHub repo (or upload manually)
3. Set:
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. Add all environment variables from your `.env` file
5. Deploy → you get a URL like: `https://gasc-newsletter.onrender.com`

### 9.2 Update Frontend API URL
- In `frontend/js/api.js`, change:
  ```js
  const BASE_URL = 'https://gasc-newsletter.onrender.com/api';
  ```

### 9.3 Deploy Frontend to Netlify
1. Go to: https://netlify.com/ → Sign up free
2. Drag and drop the `frontend/` folder into Netlify dashboard
3. Done! You get a public URL.

---

## Folder Structure Reference

```
gasc-newsletter/
├── SETUP.md              ← This file
├── frontend/
│   ├── index.html        ← Login page
│   ├── dashboard.html    ← Main dashboard (all roles)
│   ├── submit.html       ← Staff: submit event/research
│   ├── review.html       ← Principal: approve/reject
│   ├── volume.html       ← Principal: build newsletter volume
│   ├── newsletter.html   ← Preview & PDF export
│   ├── admin.html        ← Admin: college info, users, depts
│   ├── css/
│   │   └── custom.css
│   └── js/
│       ├── api.js        ← All API calls
│       ├── auth.js       ← JWT management
│       ├── components.js ← Reusable UI components
│       ├── photoGrid.js  ← Photo grid logic
│       └── newsletter.js ← Newsletter renderer
└── backend/
    ├── server.js
    ├── package.json
    ├── .env              ← YOU CREATE THIS
    ├── config/
    │   ├── db.js
    │   └── cloudinary.js
    ├── models/
    │   ├── User.js
    │   ├── Department.js
    │   ├── Submission.js
    │   ├── NewsletterVolume.js
    │   └── CollegeInfo.js
    ├── routes/
    │   ├── auth.routes.js
    │   ├── submission.routes.js
    │   ├── review.routes.js
    │   ├── volume.routes.js
    │   └── admin.routes.js
    ├── middleware/
    │   ├── auth.middleware.js
    │   └── role.middleware.js
    └── utils/
        ├── upload.js
        ├── response.js
        └── seed.js
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `npm install` fails | Make sure Node.js is installed: `node -v` |
| MongoDB connection error | Check your Atlas IP whitelist + correct password in .env |
| Cloudinary upload fails | Double-check API keys in .env |
| CORS error in browser | Make sure backend is running on port 5000 |
| Login not working | Run `node utils/seed.js` first to create accounts |

---

## Need Help?
Check the browser console (F12 → Console) for error messages.
Check terminal where backend is running for server errors.
