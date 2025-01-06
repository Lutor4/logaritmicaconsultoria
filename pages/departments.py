import streamlit as st
import pandas as pd
from utils.supabase import get_supabase_client

def show():
    st.title("Departments")
    
    # Get authenticated client
    client = get_supabase_client()
    
    # Add Department Form
    with st.expander("Add New Department"):
        with st.form("department_form"):
            name = st.text_input("Department Name")
            budget = st.number_input("Budget", min_value=0.0, step=1000.0)
            email = st.text_input("Department Email")
            password = st.text_input("Password", type="password")
            
            submitted = st.form_submit_button("Create Department")
            if submitted:
                try:
                    # Create auth user
                    auth_response = client.auth.sign_up({
                        "email": email,
                        "password": password,
                        "options": {
                            "data": {
                                "role": "department"
                            }
                        }
                    })
                    
                    if auth_response.user:
                        # Create department
                        dept_response = client.table('departments').insert({
                            "name": name,
                            "budget": budget,
                            "user_id": auth_response.user.id,
                            "municipality_id": st.session_state.user.id
                        }).execute()
                        
                        if dept_response.data:
                            st.success("Department created successfully!")
                            st.experimental_rerun()
                except Exception as e:
                    st.error(f"Error creating department: {str(e)}")
    
    try:
        # Display Departments Table with proper auth
        response = client.table('departments').select("*").execute()
        
        if response.data:
            df = pd.DataFrame(response.data)
            df['created_at'] = pd.to_datetime(df['created_at']).dt.strftime('%Y-%m-%d')
            df['budget'] = df['budget'].apply(lambda x: f"R$ {x:,.2f}")
            
            st.dataframe(
                df[['name', 'budget', 'created_at']],
                column_config={
                    "name": "Name",
                    "budget": "Budget",
                    "created_at": "Created At"
                },
                hide_index=True
            )
        else:
            st.info("No departments found")
    except Exception as e:
        st.error(f"Error loading departments: {str(e)}")