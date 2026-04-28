# 🏙️ Smart Urban Expansion Analyzer

![Urban Growth Analytics](https://img.shields.io/badge/AI--Powered-Urban%20Growth-blue)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)
![Python](https://img.shields.io/badge/AI%20App-Streamlit-FF4B4B?logo=streamlit&logoColor=white)
![Google Gemini](https://img.shields.io/badge/RAG%20Assistant-Google%20Gemini-4285F4?logo=google&logoColor=white)

An **AI-Powered Urban Growth Prediction System** built to monitor, analyze, and predict urban development with advanced machine learning and real-time data analytics. This full-stack application integrates a powerful Node.js/React dashboard with a Python-based Streamlit application using U-Net deep learning models for satellite image analysis, alongside a fully integrated Retrieval-Augmented Generation (RAG) AI Chatbot.

---

## ✨ Key Features

### 🧠 Advanced AI Predictions & Analysis
- **U-Net Deep Learning Model:** Analyzes historical satellite imagery to predict future urban growth, expansion patterns, and environmental impact with high accuracy (IoU, F1 Score tracking).
- **RAG AI Assistant:** An intelligent Chatbot powered by Google Gemini and MongoDB Atlas Vector Search. It dynamically reads your live database to answer highly specific questions about your urban data (e.g., "What was the population of Pune in 2011?").

### 📊 Comprehensive Sector Dashboards
A beautiful, highly interactive React dashboard featuring real-time analytics across multiple vital urban sectors:
- **👥 Population Dashboard:** Tracks demographic changes, age distributions, density, and AI-powered population growth predictions.
- **🏗️ Infrastructure Dashboard:** Monitors hospitals, schools, road lengths, and infrastructure budgets over time.
- **🌱 Environment Dashboard:** Visualizes AQI (Air Quality Index), green coverage, temperature trends, and CO2 emissions.
- **🚗 Transport Dashboard:** Real-time metrics on traffic index, average speed, congestion levels, and public transit usage.
- **🗺️ Zone Heatmap:** A dedicated spatial heatmap to visually analyze high-growth and high-density zones.

### 🔐 Enterprise-Grade Security
- **Secure Authentication:** JWT-based user authentication and authorization.
- **Account Recovery:** Secure "Forgot Password" mechanics via security questions.
- **Protected Routes:** The RAG AI Assistant and all analytical dashboards are strictly gated behind authenticated sessions.

### 📄 Reporting & Integration
- **PDF Report Generation:** One-click generation of comprehensive, downloadable PDF reports containing urban data tables and AI predictions using `jsPDF` and `autoTable`.
- **Seamless System Integration:** Automatic session synchronization between the React Dashboard and the Python Streamlit Analytics App.

---

## 🛠️ Technology Stack

### Frontend Architecture
- **Framework:** React 19 + Vite
- **Styling:** TailwindCSS for modern, highly responsive design
- **Routing:** React Router DOM
- **Geospatial Mapping:** React Leaflet
- **Data Visualization:** Recharts & MUI Charts
- **State Management:** React Hooks

### Backend Architecture
- **Server:** Node.js & Express.js
- **Database:** MongoDB & Mongoose (with MongoDB Atlas Vector Search)
- **AI Integration:** `@langchain/google-genai` for RAG Chatbot
- **Authentication:** JWT (JSON Web Tokens) & Bcryptjs
- **Report Generation:** jsPDF, jsPDF-autoTable

### AI & Deep Learning (Streamlit App)
- **Framework:** Python & Streamlit
- **Deep Learning Architecture:** U-Net (for image segmentation)
- **Data Processing:** NumPy, Pandas, OpenCV

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.8+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/shreyas-urankar/Smart-Urban-Expansion-Analyzer.git
cd Smart-Urban-Expansion-Analyzer
```

### 2. Backend Setup
```bash
cd backend
npm install
```
**Environment Variables (`backend/.env`):**
Create a `.env` file in the backend directory with the following keys:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/urban_expansion  # Or your Atlas URI
JWT_SECRET=your_super_secret_jwt_key
GOOGLE_API_KEY=your_google_gemini_api_key
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Streamlit App Setup
```bash
cd ../streamlit_app
pip install -r requirements.txt
streamlit run app.py
```

### 5. Seeding Data for the RAG AI
To ensure the AI Chatbot can answer questions about your dashboards, run the synchronization script:
```bash
cd backend
node scripts/syncDashboardDataToRAG.js
```

---

## 📂 Project Structure

```text
Smart-Urban-Expansion-Analyzer/
├── backend/                  # Node.js + Express backend server
│   ├── controllers/          # API logic (RAG, Auth, Data, Reports)
│   ├── models/               # Mongoose DB Schemas
│   ├── routes/               # Express API endpoints
│   └── scripts/              # Data import & Vector DB sync scripts
├── frontend/                 # React + Vite frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components & Dashboards
│   │   ├── pages/            # Main application views
│   │   └── assets/           # Images and static files
├── streamlit_app/            # Python Streamlit app for AI predictions
├── notebooks/                # Jupyter notebooks for model training/testing
└── data/                     # Datasets and generated models
```

---

## 💡 Usage Guide

1. **Register/Login:** Create an account to access the dashboard.
2. **Navigate Dashboards:** Use the sidebar or the top navigation pill-bar to switch between Population, Infrastructure, Environment, and Transport data.
3. **Generate Predictions:** Navigate to the specific dashboard (e.g., Population) and enter a target year to see AI-forecasted metrics.
4. **Ask the AI:** Click the floating Chatbot icon in the bottom right to ask natural language questions about your data.

---

## 🤝 Contributing
Contributions, issues, and feature requests are highly welcome! Feel free to check the issues page.

## 📝 License
This project is licensed under the ISC License.
