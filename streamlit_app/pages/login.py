import streamlit as st
import requests
import sys
import os

# Add current directory to Python path
# .
current_dir = os.path.dirname(__file__)
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from utils import save_token, get_token

st.set_page_config(page_title="Login", page_icon="🔐", layout="centered")

# Check if already logged in
token = get_token()
if token:
    st.success("✅ You are already logged in!")
    if st.button("Go to Dashboard"):
        st.switch_page("pages/dashboard.py")
    st.stop()

st.title("🔐 Login to Urban Growth Dashboard")

username = st.text_input("👤 Username", placeholder="Enter your username")
password = st.text_input("🔒 Password", type="password", placeholder="Enter your password")

if st.button("🚀 Login", type="primary", use_container_width=True):
    if not username or not password:
        st.error("❌ Please enter both username and password")
    else:
        try:
            with st.spinner("Authenticating..."):
                response = requests.post(
                    "http://localhost:5000/api/users/login", 
                    json={"username": username, "password": password},
                    timeout=10
                )

            if response.status_code == 200:
                data = response.json()
                token = data.get("token")
                if token:
                    save_token(token)
                    st.success("✅ Login successful! Loading Dashboard...")
                    st.balloons()
                    st.switch_page("pages/dashboard.py")
                else:
                    st.error("❌ No authentication token received")
            else:
                error_msg = response.json().get('message', 'Login failed')
                st.error(f"❌ {error_msg}")
                
        except requests.exceptions.ConnectionError:
            st.error("❌ Cannot connect to server. Please ensure the backend is running on http://localhost:5000")
        except Exception as e:
            st.error(f"❌ An error occurred: {e}")

# Registration link
st.markdown("---")
st.markdown("Don't have an account? [Register here](Register)")