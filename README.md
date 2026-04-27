# 🏙️ Smart Urban Expansion Analyzer

![Urban Growth Analytics](https://img.shields.io/badge/AI--Powered-Urban%20Growth-blue)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)
![Python](https://img.shields.io/badge/AI%20App-Streamlit-FF4B4B?logo=streamlit&logoColor=white)

An **AI-Powered Urban Growth Prediction System** built to monitor and predict urban development with advanced analytics. This full-stack application integrates a powerful Node.js/React dashboard with a Python-based Streamlit application using U-Net deep learning models for satellite image analysis.

## ✨ Features

- **🧠 Advanced AI Predictions:** Utilizes a U-Net deep learning model to predict urban growth and expansion patterns from satellite imagery.
- **📊 Interactive Dashboard:** A beautiful React-based dashboard with real-time analytics, charts (Recharts/MUI), and interactive maps (Leaflet).
- **🔐 Secure Authentication:** JWT-based user authentication and authorization.
- **📄 Report Generation:** Generate and download comprehensive PDF reports of urban data and predictions.
- **🌍 System Integration:** Seamless auto-login integration between the React Dashboard and the Streamlit Analytics App.

## 🛠️ Technology Stack

### Frontend
- **React 19** with **Vite**
- **TailwindCSS** for modern, responsive styling
- **React Router DOM** for navigation
- **React Leaflet** for geospatial mapping
- **Recharts & MUI Charts** for data visualization

### Backend
- **Node.js & Express.js**
- **MongoDB & Mongoose** for data storage
- **JWT (JSON Web Tokens)** for secure authentication
- **Bcryptjs** for password hashing
- **jsPDF & autoTable** for PDF report generation

### AI & Analytics (Streamlit App)
- **Python** & **Streamlit**
- **U-Net** deep learning architecture for image segmentation
- **NumPy, Pandas, OpenCV** for data processing

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/), [Python](https://www.python.org/), and [MongoDB](https://www.mongodb.com/) installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/shreyas-urankar/Smart-Urban-Expansion-Analyzer.git
cd Smart-Urban-Expansion-Analyzer
```

### 2. Backend Setup
```bash
cd backend
npm install
# Create a .env file and add your MONGO_URI and JWT_SECRET
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
pip install -r requirements.txt # Make sure you have your python packages installed
streamlit run app.py
```

## 📂 Project Structure

```text
Smart-Urban-Expansion-Analyzer/
├── backend/            # Node.js + Express backend server
├── frontend/           # React + Vite frontend application
├── streamlit_app/      # Python Streamlit app for AI predictions
├── notebooks/          # Jupyter notebooks for model training/testing
├── data/               # Datasets and generated models
└── config.py           # General Python configuration
```

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📝 License
This project is licensed under the ISC License.
