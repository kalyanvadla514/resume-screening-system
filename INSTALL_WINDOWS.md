# Installation & Setup (Windows)

Follow these steps in **PowerShell** or **Command Prompt**. If you already have the project folder, skip step 1.

---

## 1. Clone the repository (optional)

If you don’t have the project yet:

```powershell
git clone <repository-url>
cd resume-screening-system
```

---

## 2. Backend setup

Already done for you in this project:

- **`.env`** – created from `.env.example` (edit if you need different MongoDB URL or JWT secret).
- **`uploads`** – folder created.

Run:

```powershell
cd backend
npm install
```

Then start the backend:

```powershell
npm run dev
```

Backend will be at **http://localhost:5000**. Leave this terminal open.

---

## 3. ML service setup

Open a **new** terminal:

```powershell
cd C:\Users\vadla\OneDrive\Desktop\resume-screening-system\ml-service
```

Create and activate the virtual environment:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

If you get an execution policy error, run once:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then install dependencies and NLTK data:

```powershell
pip install -r requirements.txt
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"
```

Start the ML service:

```powershell
python main.py
```

ML service will be at **http://localhost:8000**. Leave this terminal open.

---

## 4. Frontend setup

Open another **new** terminal:

```powershell
cd C:\Users\vadla\OneDrive\Desktop\resume-screening-system\frontend
npm install
npm run dev
```

Frontend will be at **http://localhost:3000**.

---

## 5. MongoDB

On Windows, if you installed MongoDB as a service, it should start automatically.

To check:

```powershell
mongod --version
```

To start the service manually (Run as Administrator if needed):

```powershell
net start MongoDB
```

---

## 6. Run the app

1. **MongoDB** – running (service or `mongod`).
2. **Backend** – terminal 1: `cd backend` → `npm run dev`.
3. **ML service** – terminal 2: `cd ml-service` → activate venv → `python main.py`.
4. **Frontend** – terminal 3: `cd frontend` → `npm run dev`.

Then open **http://localhost:3000** in your browser.

---

## Optional: edit `.env`

Edit `backend\.env` if you need to change:

- **MONGODB_URI** – if MongoDB is on another host/port.
- **JWT_SECRET** – use a long random string in production.
