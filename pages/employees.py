import streamlit as st
import pandas as pd
from utils.supabase import get_supabase_client

def show():
    st.title("Employees")
    
    # Get authenticated client
    client = get_supabase_client()
    
    # Add Employee Form
    with st.expander("Add New Employee"):
        with st.form("employee_form"):
            full_name = st.text_input("Full Name")
            
            # Get departments for dropdown
            dept_response = client.table('departments').select("id, name").execute()
            departments = {d['name']: d['id'] for d in dept_response.data} if dept_response.data else {}
            
            department = st.selectbox("Department", options=list(departments.keys()))
            position = st.text_input("Position")
            
            submitted = st.form_submit_button("Add Employee")
            if submitted:
                try:
                    response = client.table('employees').insert({
                        "full_name": full_name,
                        "department_id": departments[department],
                        "position": position,
                        "municipality_id": st.session_state.user.id
                    }).execute()
                    
                    if response.data:
                        st.success("Employee added successfully!")
                        st.experimental_rerun()
                except Exception as e:
                    st.error(f"Error adding employee: {str(e)}")
    
    try:
        # Display Employees Table
        response = client.table('employees').select(
            "*, departments(name)"
        ).execute()
        
        if response.data:
            # Transform data for display
            df = pd.DataFrame([{
                'full_name': emp['full_name'],
                'department': emp['departments']['name'],
                'position': emp['position'],
                'created_at': emp['created_at']
            } for emp in response.data])
            
            df['created_at'] = pd.to_datetime(df['created_at']).dt.strftime('%Y-%m-%d')
            
            st.dataframe(
                df,
                column_config={
                    "full_name": "Full Name",
                    "department": "Department",
                    "position": "Position",
                    "created_at": "Created At"
                },
                hide_index=True
            )
        else:
            st.info("No employees found")
    except Exception as e:
        st.error(f"Error loading employees: {str(e)}")