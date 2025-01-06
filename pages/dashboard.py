import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
from supabase import create_client
import os
import pandas as pd

def show():
    st.title("Dashboard")
    
    # Initialize Supabase client
    supabase = create_client(
        os.getenv("VITE_SUPABASE_URL"),
        os.getenv("VITE_SUPABASE_ANON_KEY")
    )
    
    # Create layout columns
    col1, col2 = st.columns(2)
    
    with col1:
        # Department Budget Chart
        st.subheader("Department Budgets")
        response = supabase.table('departments').select("name, budget").execute()
        if response.data:
            df = pd.DataFrame(response.data)
            fig = px.bar(df, x='name', y='budget', title='Department Budgets')
            st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        # Employee Distribution Chart
        st.subheader("Employee Distribution")
        response = supabase.table('employees').select("department_id, departments(name)").execute()
        if response.data:
            df = pd.DataFrame(response.data)
            employee_counts = df.groupby('departments.name').size().reset_index(name='count')
            fig = px.pie(employee_counts, values='count', names='departments.name', 
                        title='Employees by Department')
            st.plotly_chart(fig, use_container_width=True)
    
    # Statistics Cards
    st.subheader("Key Statistics")
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        employees_count = len(supabase.table('employees').select("*").execute().data)
        st.metric("Total Employees", employees_count)
    
    with col2:
        departments_count = len(supabase.table('departments').select("*").execute().data)
        st.metric("Departments", departments_count)
    
    with col3:
        projects_count = len(supabase.table('projects').select("*").execute().data)
        st.metric("Active Projects", projects_count)
    
    with col4:
        total_budget = sum(d['budget'] for d in supabase.table('departments').select("budget").execute().data)
        st.metric("Total Budget", f"R$ {total_budget:,.2f}")