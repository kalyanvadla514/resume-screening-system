# 🗄️ MongoDB Database - Complete Explanation

## 📋 Table of Contents
1. [What is MongoDB and How Your Project Uses It](#what-is-mongodb)
2. [Your MongoDB Connection - Free Account](#your-mongodb-connection)
3. [How It Works in Your Project](#how-it-works-in-your-project)
4. [Data Storage Structure](#data-storage-structure)
5. [Is It Using Your Account?](#is-it-using-your-account)
6. [Privacy & Security](#privacy--security)
7. [Free Tier Limits](#free-tier-limits)
8. [How to Set Up MongoDB](#how-to-set-up-mongodb)

---

## 🤔 What is MongoDB?

### Simple Explanation:
MongoDB is like a **digital filing cabinet** that stores all your data in the cloud or on your computer. Instead of Excel sheets or physical files, all your information is stored in MongoDB.

### For Your Project:
MongoDB stores:
- 👤 **User accounts** (recruiters who log in)
- 📄 **Resumes** (uploaded candidate information)
- 💼 **Jobs** (job postings)
- 📊 **Match results** (scores between resumes and jobs)

---

## 🔗 Your MongoDB Connection - Free Account

### Two Ways to Use MongoDB:

#### **Option 1: Local MongoDB (What you likely have now)**

**What it means:**
- MongoDB running **on your computer**
- Data stored **on your hard drive**
- **Free forever**, unlimited usage
- **Only you** can access it
- Data deleted if you uninstall MongoDB

**Connection String:**
```
mongodb://localhost:27017/resume-screening
```

**Breakdown:**
- `localhost` = Your computer
- `27017` = MongoDB's port number
- `resume-screening` = Database name

**Pros:**
- ✅ Completely free
- ✅ No internet needed
- ✅ Full control
- ✅ Unlimited storage (as much as your hard drive has)

**Cons:**
- ❌ Only works on your computer
- ❌ Data lost if computer crashes
- ❌ Can't access from other devices
- ❌ Not production-ready

---

#### **Option 2: MongoDB Atlas (Cloud - Free Tier)**

**What it means:**
- MongoDB in the **cloud** (internet)
- Data stored on **MongoDB's servers**
- **Free tier: 512MB storage**
- Accessible from **anywhere**
- Your data is **safe** even if your computer dies

**Connection String:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/resume-screening
```

**Free Tier Includes:**
- 512MB storage (enough for ~10,000-50,000 resumes depending on size)
- Shared cluster (still fast enough)
- Automatic backups
- No credit card required

**Pros:**
- ✅ Accessible from anywhere
- ✅ Professional, production-ready
- ✅ Automatic backups
- ✅ Can deploy your app to internet
- ✅ Secure and reliable

**Cons:**
- ❌ 512MB limit on free tier
- ❌ Requires internet connection

---

## 🔍 How It Works in Your Project

### The Connection Flow:

```
┌─────────────────────────────────────────┐
│  1. YOU START BACKEND SERVER            │
│     cd backend                           │
│     npm run dev                          │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│  2. SERVER READS .env FILE               │
│     MONGODB_URI=mongodb://localhost...   │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│  3. MONGOOSE CONNECTS TO MONGODB         │
│     mongoose.connect(process.env.MONGODB_URI) │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│  4. CONNECTION SUCCESSFUL                │
│     Console: "✅ MongoDB Connected"      │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│  5. YOUR APP CAN NOW:                    │
│     • Save users                         │
│     • Save resumes                       │
│     • Save jobs                          │
│     • Query data                         │
└─────────────────────────────────────────┘
```

### Where is Your Data?

**If using localhost:**
```
Your Computer
└── MongoDB Data Files
    └── /var/lib/mongodb/
        └── resume-screening/
            ├── users.bson
            ├── resumes.bson
            └── jobs.bson
```

**If using Atlas (cloud):**
```
MongoDB Atlas Servers (Cloud)
└── Your Cluster
    └── resume-screening database
        ├── users collection
        ├── resumes collection
        └── jobs collection
```

---

## 💾 Data Storage Structure

### What's Actually Saved in MongoDB:

#### **1. Users Collection**
Every time someone registers:
```javascript
{
  _id: "507f1f77bcf86cd799439011",  // Unique ID
  name: "Kalyan",
  email: "vadlakalyankumar@gmail.com",
  password: "$2a$10$hashed...",  // Encrypted, not readable
  role: "recruiter",
  company: "Your Company",
  createdAt: "2026-02-19T10:30:00Z",
  lastLogin: "2026-02-19T15:45:00Z"
}
```

**Size:** ~500 bytes per user
**Free tier can store:** ~1 million users

#### **2. Resumes Collection**
Every time you upload a resume:
```javascript
{
  _id: "699711132928a1d465ea57fb1",
  candidateName: "Vadla Kalyan Kumar",
  email: "vadlakalyankumar@gmail.com",
  phone: "+91-1234567890",
  fileUrl: "uploads/resume-1234567890.pdf",
  fileName: "Vadla_Resume.pdf",
  fileType: "pdf",
  skills: ["REST API", "Testing", "NLP", "JavaScript"],
  experience: 0,
  education: [
    {
      degree: "B.Tech",
      institution: "University Name",
      year: "2024"
    }
  ],
  extractedText: "full text from resume...",  // Can be large
  jobApplications: [
    {
      jobId: "507f1f77bcf86cd799439012",
      matchScore: 78,
      status: "pending",
      appliedDate: "2026-02-19T16:00:00Z"
    }
  ],
  uploadedBy: "507f1f77bcf86cd799439011",  // User who uploaded
  createdAt: "2026-02-19T14:20:00Z"
}
```

**Size:** ~5-50 KB per resume (depends on text length)
**Free tier can store:** ~10,000-100,000 resumes

#### **3. Jobs Collection**
Every time you create a job:
```javascript
{
  _id: "507f1f77bcf86cd799439012",
  title: "Senior Full Stack Developer",
  description: "We are looking for...",
  department: "Engineering",
  location: "Remote",
  employmentType: "full-time",
  experienceLevel: "senior",
  requiredSkills: [
    {
      skill: "JavaScript",
      importance: "required",
      weight: 10
    },
    {
      skill: "React",
      importance: "required",
      weight: 9
    }
  ],
  minExperience: 3,
  maxExperience: 8,
  status: "active",
  applicantsCount: 45,
  postedBy: "507f1f77bcf86cd799439011",
  createdAt: "2026-02-15T09:00:00Z"
}
```

**Size:** ~2-10 KB per job
**Free tier can store:** ~50,000-250,000 jobs

---

## ❓ Is It Using Your Account?

### **YES** - If You Set It Up

MongoDB is **YOUR DATABASE**. It's like:
- Your Google Drive (you own the files)
- Your email account (you control the data)
- Your personal storage

### What This Means:

#### **If Using Local MongoDB:**
```
✅ Database is on YOUR computer only
✅ Only YOU can access it
✅ Data exists only on your machine
✅ No connection to anyone else's data
✅ Completely private and isolated
```

#### **If Using MongoDB Atlas (Cloud):**
```
✅ You created the cluster (database)
✅ You have the username and password
✅ Only YOU can access your cluster
✅ Your data is separate from others
✅ Each MongoDB Atlas account has isolated databases
```

### Important Points:

1. **Your project DOES NOT share data with other users of this project code**
   - Each person running this project has their OWN database
   - Your resumes are NOT visible to anyone else
   - You won't see other people's data

2. **The connection is in YOUR .env file**
   ```env
   # This is YOUR unique connection
   MONGODB_URI=mongodb://localhost:27017/resume-screening
   
   # Or YOUR unique Atlas connection
   MONGODB_URI=mongodb+srv://youruser:yourpass@yourcluster...
   ```

3. **Like having your own filing cabinet**
   - You have the key (connection string)
   - Only you can open it
   - Your data is private

---

## 🔒 Privacy & Security

### Your Data is Safe Because:

1. **Local MongoDB:**
   - Stored only on your computer
   - Protected by your computer's security
   - No one can access without physical access to your machine

2. **MongoDB Atlas (Cloud):**
   - Your cluster is password-protected
   - Data encrypted in transit (HTTPS)
   - Data encrypted at rest
   - MongoDB has bank-level security
   - Two-factor authentication available

### What's Stored:

**Sensitive Data (Encrypted):**
- ✅ Passwords: Hashed with bcrypt (cannot be reversed)
- ✅ JWT tokens: Signed and encrypted

**Personal Data (Plain Text):**
- Candidate names, emails, phone numbers
- Resume text
- Skills, experience

**Security Best Practices:**
- Never commit .env file to Git (contains password)
- Use strong MongoDB passwords
- Enable MongoDB Atlas IP whitelist
- Regular backups

---

## 📊 Free Tier Limits (MongoDB Atlas)

### What You Get Free:

| Feature | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **Storage** | 512 MB | Unlimited |
| **RAM** | Shared | Dedicated |
| **Connections** | Up to 500 | Unlimited |
| **Backups** | Manual | Automatic |
| **Cost** | $0/month | $0.08+/hour |

### How Much Can You Store?

**512 MB is enough for:**
```
Option A: Text-heavy storage
- 100,000 resumes (5KB each)
- 10,000 jobs
- 1,000 users

Option B: Moderate usage
- 20,000 resumes with full text
- 5,000 jobs
- 500 users

Option C: Your actual usage (likely)
- 1,000-5,000 resumes
- 100-500 jobs
- 50-100 users
→ Uses only 50-100 MB (20% of limit)
```

### When Will You Run Out?

**Never, if you:**
- ✅ Use for learning/portfolio
- ✅ Have < 5,000 resumes
- ✅ Delete old/test data regularly

**Might run out if:**
- ❌ Upload thousands of resumes daily
- ❌ Store large PDF files in database (don't do this!)
- ❌ Running production company with 50,000+ candidates

---

## 🚀 How to Set Up MongoDB

### Option 1: Local MongoDB (Easiest)

**Already installed?** Check:
```bash
mongosh --version
# or
mongo --version
```

**Not installed?** 

**Windows:**
1. Download: https://www.mongodb.com/try/download/community
2. Run installer
3. Keep default settings
4. MongoDB runs automatically

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongod
```

**Use in your project:**
```env
# .env file
MONGODB_URI=mongodb://localhost:27017/resume-screening
```

---

### Option 2: MongoDB Atlas (Cloud - Recommended)

**Step 1: Create Account**
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up (free, no credit card)
3. Verify email

**Step 2: Create Cluster**
1. Choose "Shared" (Free tier)
2. Select cloud provider (AWS/Google/Azure)
3. Choose region closest to you
4. Click "Create Cluster" (takes 3-5 minutes)

**Step 3: Create Database User**
1. Go to "Database Access"
2. Click "Add New Database User"
3. Username: `resumeai`
4. Password: Generate strong password
5. Set privileges: "Read and write to any database"
6. Click "Add User"

**Step 4: Configure Network Access**
1. Go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
   - Or add your specific IP for security
4. Click "Confirm"

**Step 5: Get Connection String**
1. Go to "Database" → "Connect"
2. Choose "Connect your application"
3. Copy connection string:
   ```
   mongodb+srv://resumeai:<password>@cluster0.xxxxx.mongodb.net/
   ```
4. Replace `<password>` with your actual password
5. Add database name at end: `/resume-screening`

**Final connection string:**
```
mongodb+srv://resumeai:your-password@cluster0.xxxxx.mongodb.net/resume-screening
```

**Step 6: Use in Project**
```env
# .env file
MONGODB_URI=mongodb+srv://resumeai:your-password@cluster0.xxxxx.mongodb.net/resume-screening
```

---

## ✅ Summary

### Quick Answers:

**Q: Does my project use MongoDB?**
A: YES - it's the database storing all your data

**Q: Is it using my account?**
A: YES - YOUR database, YOUR data, completely private

**Q: Is it linked only to my account?**
A: YES - only YOU can access your database with your connection string

**Q: Will others see my data?**
A: NO - each person has their own separate database

**Q: Is the free tier enough?**
A: YES - 512MB is plenty for learning and small-scale use

**Q: What happens if I run out of space?**
A: You'll get warnings, can upgrade to paid tier (~$9/month)

**Q: Is my data safe?**
A: YES - passwords encrypted, secure connections, isolated database

### Current Setup (Most Likely):

```
You Are Using: Local MongoDB
Location: Your computer
Storage: Limited by your hard drive
Access: Only you, on this computer
Cost: Free forever
Good for: Development and learning
```

### Recommended for Production:

```
Should Use: MongoDB Atlas (Cloud)
Location: Cloud servers
Storage: 512MB free (upgradable)
Access: From anywhere with internet
Cost: Free tier available
Good for: Real deployment
```

---

Now you understand exactly how MongoDB works in your project! 🎉
