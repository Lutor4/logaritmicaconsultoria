import streamlit as st
from supabase import create_client
import os
from dotenv import load_dotenv
from pages import (
    login,
    dashboard,
    departments,
    employees,
    projects,
    forms,
    settings
)

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase = create_client(
    os.getenv("VITE_SUPABASE_URL"),
    os.getenv("VITE_SUPABASE_ANON_KEY")
)

# Configure Streamlit page
st.set_page_config(
    page_title="Municipal Dashboard",
    page_icon="🏛️",
    layout="wide"
)

# Initialize session state
if 'authenticated' not in st.session_state:
    st.session_state.authenticated = False
if 'user' not in st.session_state:
    st.session_state.user = None
if 'current_page' not in st.session_state:
    st.session_state.current_page = 'login'

def main():
    if not st.session_state.authenticated:
        login.show()
    else:
        # Sidebar navigation
        with st.sidebar:
            st.title("Municipal Dashboard")
            
            # Navigation menu
            menu_items = {
                'Dashboard': 'dashboard',
                'Departments': 'departments',
                'Employees': 'employees',
                'Projects': 'projects',
                'Forms': 'forms',
                'Settings': 'settings'
            }
            
            for label, page in menu_items.items():
                if st.button(label):
                    st.session_state.current_page = page
            
            # Logout button
            if st.button("Logout"):
                st.session_state.authenticated = False
                st.session_state.user = None
                st.session_state.current_page = 'login'
                st.experimental_rerun()
        
        # Main content
        if st.session_state.current_page == 'dashboard':
            dashboard.show()
        elif st.session_state.current_page == 'departments':
            departments.show()
        elif st.session_state.current_page == 'employees':
            employees.show()
        elif st.session_state.current_page == 'projects':
            projects.show()
        elif st.session_state.current_page == 'forms':
            forms.show()
        elif st.session_state.current_page == 'settings':
            settings.show()

if __name__ == "__main__":
    main()