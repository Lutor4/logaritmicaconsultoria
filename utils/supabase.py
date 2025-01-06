from supabase import create_client
import os
import streamlit as st

def get_supabase_client():
    """Get authenticated Supabase client using session token"""
    client = create_client(
        os.getenv("VITE_SUPABASE_URL"),
        os.getenv("VITE_SUPABASE_ANON_KEY")
    )
    
    # Set auth token if user is logged in
    if 'token' in st.session_state:
        client.auth.set_session(st.session_state.token)
    
    return client