-- List all profiles with their roles and departments
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.municipality,
  p.role,
  d.name as department_name,
  p.created_at
FROM profiles p
LEFT JOIN departments d ON p.department_id = d.id
ORDER BY p.created_at DESC;