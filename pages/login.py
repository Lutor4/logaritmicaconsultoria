import streamlit as st
from utils.supabase import get_supabase_client

def show():
    st.title("Login")
    
    with st.form("login_form"):
        email = st.text_input("Email")
        password = st.text_input("Password", type="password")
        submitted = st.form_submit_button("Login")
        
        if submitted:
            try:
                client = get_supabase_client()
                response = client.auth.sign_in_with_password({
                    "email": email,
                    "password": password
                })
                
                if response.user:
                    # Store auth data in session
                    st.session_state.authenticated = True
                    st.session_state.user = response.user
                    st.session_state.token = response.session.access_token
                    st.session_state.current_page = 'dashboard'
                    st.experimental_rerun()
                else:
                    st.error("Invalid credentials")
            except Exception as e:
                st.error(f"Login failed: {str(e)}")