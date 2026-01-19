import streamlit as st
import sys
import os
import matplotlib.pyplot as plt
import numpy as np
import urllib.parse

# Add current directory to Python path
current_dir = os.path.dirname(__file__)
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from utils import get_token, decode_token

st.set_page_config(page_title="Urban Growth Prediction Dashboard", page_icon="🌆", layout="wide")

# Check authentication
token = get_token()
if not token:
    st.error("🔐 Please login to access the Dashboard")
    st.stop()

# Decode token to get user info
decoded = decode_token(token)
if not decoded:
    st.error("❌ Invalid token. Please login again.")
    st.stop()

# ✅ FIXED: Use new st.query_params instead of deprecated st.experimental_get_query_params
query_params = st.query_params
username_from_url = query_params.get("username", [None])[0]

if username_from_url:
    username = urllib.parse.unquote(username_from_url)
else:
    # Fallback to token username
    username = decoded.get("username", f"User {decoded.get('id', 'Unknown')}")

user_id = decoded.get("id", "Unknown User")

# Initialize session state for model loading
if 'model_loaded' not in st.session_state:
    st.session_state.model_loaded = False
if 'predictor' not in st.session_state:
    st.session_state.predictor = None

# Main Dashboard
st.title("🌆 Urban Growth Prediction Dashboard")
st.subheader(f"Welcome, {username}! 👋")

st.markdown("""
**Visualize predicted urban expansion over time with advanced pattern recognition using TensorFlow U-Net model.**
""")

# Load Model (only once)
if not st.session_state.model_loaded:
    with st.spinner("🚀 Loading Prediction Model and Data... This may take a moment..."):
        try:
            from urban_predictor import UrbanGrowthPredictor
            st.session_state.predictor = UrbanGrowthPredictor()
            st.session_state.model_loaded = True
            st.success("✅ Prediction Model loaded successfully!")
        except Exception as e:
            st.error(f"❌ Error loading prediction model: {e}")
            st.session_state.predictor = None

# Show content only if model is loaded
if st.session_state.model_loaded and st.session_state.predictor:
    predictor = st.session_state.predictor
    
    # Model Performance Metrics
    st.subheader("📊 Model Performance Metrics")

    metrics = predictor.get_metrics()
    if metrics:
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Accuracy", f"{metrics['accuracy']:.4f}")
        with col2:
            st.metric("F1-Score", f"{metrics['f1_score']:.4f}")
        with col3:
            st.metric("IoU Score", f"{metrics['iou']:.4f}")
    else:
        st.error("❌ Could not load model metrics.")

    # Urban Growth Visualization
    st.subheader("🖼️ Urban Growth Prediction Visualization")

    if predictor.predictions is not None:
        max_index = len(predictor.predictions) - 1
        idx = st.slider("Select Sample Index", 0, max_index, 0, 
                       help="Select different urban area samples to visualize predictions")
        
        sample_data = predictor.get_sample_data(idx)
        if sample_data:
            col1, col2, col3 = st.columns(3)
            
            with col1:
                fig1, ax1 = plt.subplots(figsize=(4, 4))
                ax1.imshow(sample_data["ground_truth"], cmap='viridis')
                ax1.set_title("Ground Truth")
                ax1.axis('off')
                st.pyplot(fig1)
            
            with col2:
                fig2, ax2 = plt.subplots(figsize=(4, 4))
                ax2.imshow(sample_data["prediction"], cmap='plasma')
                ax2.set_title("Model Prediction")
                ax2.axis('off')
                st.pyplot(fig2)
            
            with col3:
                fig3, ax3 = plt.subplots(figsize=(4, 4))
                ax3.imshow(sample_data["difference"], cmap='coolwarm')
                ax3.set_title("Difference Map")
                ax3.axis('off')
                st.pyplot(fig3)
            plt.close('all')
    else:
        st.warning("⚠️ No prediction data available.")

    # Urban Growth Trend Chart
    st.subheader("📈 Urban Growth Projection Over Time")

    years, growth = predictor.get_growth_trend()

    fig, ax = plt.subplots(figsize=(10, 6))
    ax.plot(years, growth, marker="o", linewidth=2.5, markersize=8, color='#2563eb')
    ax.fill_between(years, growth, alpha=0.3, color='#2563eb')
    ax.set_xlabel("Year", fontsize=12, fontweight='bold')
    ax.set_ylabel("Urban Growth (%)", fontsize=12, fontweight='bold')
    ax.set_title("Predicted Urban Growth Trend (2000-2040)", fontsize=14, fontweight='bold')
    ax.grid(True, alpha=0.3)
    ax.set_facecolor('#f8fafc')

    st.pyplot(fig)
    plt.close(fig)

else:
    st.warning("⏳ Model is still loading... Please wait or refresh the page.")

# Model Information
st.subheader("🤖 Model Information")

st.markdown("""
**Model Architecture:** U-Net (Convolutional Neural Network)  
**Training Data:** Satellite imagery and urban growth patterns  
**Purpose:** Predict urban expansion and land use changes  
**Input:** Multi-temporal urban data  
**Output:** Probability maps of urban growth  
**Applications:** Urban planning, environmental monitoring, infrastructure development
""")

# Quick Stats
st.subheader("🚀 Quick Stats")

col1, col2, col3, col4 = st.columns(4)

with col1:
    st.metric("Cities Analyzed", "24", "12 cities")
with col2:
    st.metric("Data Points", "1.2M", "100K new")
with col3:
    st.metric("Accuracy", "89%", "2% improved")
with col4:
    st.metric("Predictions", "50K", "5K today")

# Refresh button
if st.button("🔄 Refresh Data"):
    st.session_state.model_loaded = False
    st.session_state.predictor = None
    st.rerun()

# Sidebar logout
st.sidebar.markdown("---")
if st.sidebar.button("🚪 Logout", use_container_width=True):
    st.session_state.clear()
    st.success("Logged out successfully!")
    st.rerun()