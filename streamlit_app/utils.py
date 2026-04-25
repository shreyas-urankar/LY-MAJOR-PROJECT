import streamlit as st
import jwt
import urllib.parse

def save_token(token):
    """Save JWT token to session state"""
    st.session_state["jwt_token"] = token

def get_token():
    """Get token from URL params first, then session state"""
    # Try to get from URL parameters (passed from React frontend)
    query_params = st.query_params
    
    # Handle both dict-like and object-like access
    try:
        token_from_url = query_params.get("token", None)
    except:
        token_from_url = getattr(query_params, "token", None)
    
    if token_from_url:
        # If token exists in URL, save it to session
        st.session_state["jwt_token"] = token_from_url
        return token_from_url
    
    # Fallback to session state
    return st.session_state.get("jwt_token", None)

def decode_token(token):
    """Decode JWT token without verification"""
    try:
        decoded = jwt.decode(token, options={"verify_signature": False})
        return decoded
    except Exception as e:
        return None

def get_username():
    """Get username from URL params or token"""
    query_params = st.query_params
    
    # Handle both dict-like and object-like access
    try:
        username_from_url = query_params.get("username", None)
    except:
        username_from_url = getattr(query_params, "username", None)
    
    if username_from_url:
        return urllib.parse.unquote(username_from_url)
    
    # Fallback to token
    token = get_token()
    if token:
        decoded = decode_token(token)
        if decoded:
            return decoded.get("username", "Unknown User")
    
    return None

def is_authenticated():
    """Check if user is authenticated"""
    token = get_token()
    if not token:
        return False
    
    decoded = decode_token(token)
    return decoded is not None

def clear_session():
    """Clear all session data"""
    for key in list(st.session_state.keys()):
        del st.session_state[key]