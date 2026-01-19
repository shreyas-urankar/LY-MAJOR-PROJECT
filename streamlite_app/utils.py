import streamlit as st
import jwt
import urllib.parse

def save_token(token):
    st.session_state["jwt_token"] = token

def get_token():
    """Get token from URL params or session state"""
    try:
        # Try to get from URL parameters first (from React iframe)
        # .
        query_params = st.query_params
        
        # Get token from URL
        token_from_url = query_params.get("token", [None])[0]
        if token_from_url:
            token = urllib.parse.unquote(token_from_url)
            save_token(token)
            return token
        
        # Get username from URL
        username_from_url = query_params.get("username", [None])[0]
        if username_from_url:
            username = urllib.parse.unquote(username_from_url)
            st.session_state["username"] = username
            
    except Exception as e:
        print(f"Warning getting token from URL: {e}")
    
    # Fallback to session state
    return st.session_state.get("jwt_token", None)

def decode_token(token):
    """Decode JWT token to get user info"""
    try:
        # Decode without verification (since we're passing from React)
        # JWT tokens from your backend have format: {id, username}
        decoded = jwt.decode(token, options={"verify_signature": False})
        
        # Store username in session state
        if "username" in decoded:
            st.session_state["username"] = decoded["username"]
        elif "user" in decoded:  # Some tokens might have "user" instead of "username"
            st.session_state["username"] = decoded["user"]
        
        return decoded
    except Exception as e:
        print(f"Token decode error: {e}")
        # Try to get username from session state or URL
        if "username" not in st.session_state:
            try:
                query_params = st.query_params
                username_from_url = query_params.get("username", [None])[0]
                if username_from_url:
                    st.session_state["username"] = urllib.parse.unquote(username_from_url)
            except:
                pass
        
        return {"username": st.session_state.get("username", "User")}

def get_username():
    """Get username from session state"""
    return st.session_state.get("username", "User")