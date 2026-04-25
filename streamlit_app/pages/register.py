import streamlit as st
import requests
import sys
import os

# Add current directory to Python path
current_dir = os.path.dirname(__file__)
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from utils import get_token

st.set_page_config(page_title="Register", page_icon="📝", layout="centered")

# Check if already logged in
token = get_token()
if token:
    st.success("✅ You are already logged in!")
    if st.button("Go to Dashboard", use_container_width=True):
        st.switch_page("pages/dashboard.py")
    st.stop()

st.title("📝 Create Dashboard Account")

st.info("💡 **Note:** Create an account here, then login via the React dashboard for seamless access!")

username = st.text_input("👤 Choose Username", placeholder="Enter a username")
password = st.text_input("🔒 Create Password", type="password", placeholder="Enter a password (min. 6 characters)")
confirm_password = st.text_input("🔒 Confirm Password", type="password", placeholder="Re-enter your password")

if st.button("🚀 Create Account", type="primary", use_container_width=True):
    # Validation
    if not username or not password:
        st.error("❌ Please enter both username and password")
    elif password != confirm_password:
        st.error("❌ Passwords do not match")
    elif len(password) < 6:
        st.error("❌ Password must be at least 6 characters long")
    else:
        try:
            with st.spinner("Creating account..."):
                response = requests.post(
                    "http://localhost:5000/api/users/register",
                    json={"username": username, "password": password},
                    timeout=10
                )

            if response.status_code == 201:
                st.success("✅ Registration successful!")
                st.balloons()
                st.info("Please login via the React dashboard at http://localhost:5173")
                st.markdown("---")
                if st.button("🔐 Login Now", use_container_width=True):
                    st.switch_page("pages/login.py")
            else:
                error_msg = response.json().get('message', 'Registration failed')
                st.error(f"❌ {error_msg}")
                
        except requests.exceptions.ConnectionError:
            st.error("❌ Cannot connect to server. Please ensure the backend is running on http://localhost:5000")
        except Exception as e:
            st.error(f"❌ An error occurred: {e}")

# Login link
st.markdown("---")
st.markdown("Already have an account? [Login here](Login)")

# Back to React dashboard
st.markdown("---")
st.markdown("🔙 [Return to React Dashboard](http://localhost:5173)")