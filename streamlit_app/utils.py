import streamlit as st
import jwt

def save_token(token):
    st.session_state["jwt_token"] = token

def get_token():
    return st.session_state.get("jwt_token", None)

def decode_token(token):
    try:
        decoded = jwt.decode(token, options={"verify_signature": False})
        return decoded
    except Exception as e:
        st.error(f"Token error: {e}")
        return None