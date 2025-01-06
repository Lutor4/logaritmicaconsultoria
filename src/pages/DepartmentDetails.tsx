import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { formService } from '../services/forms';
import { departmentService } from '../services/departments';
import { DepartmentForm } from '../components/forms/DepartmentFormResponse';
import { ImageUpload } from '../components/forms/ImageUpload';
import { ImageGallery } from '../components/images/ImageGallery';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import type { FormTemplate } from '../types/forms';
import type { Department } from '../services/departments';

export function DepartmentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [department, setDepartment] = useState<Department | null>(null);
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshImages, setRefreshImages] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptData, templatesData] = await Promise.all([
          departmentService.get(id!),
          formService.listTemplates(id)
        ]);
        
        setDepartment(deptData);
        setTemplates(templatesData);
      } catch (err) {
        console.error('Error fetching department data:', err);
        setError('Erro ao carregar dados do departamento');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!department) return <ErrorMessage message="Departamento não encontrado" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{department.name}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Upload de Imagens</h3>
            <ImageUpload 
              departmentId={id!} 
              onSuccess={() => setRefreshImages(prev => prev + 1)}
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Galeria de Imagens</h3>
            <ImageGallery 
              key={refreshImages}
              departmentId={id!} 
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Formulários Disponíveis</h3>
          {templates.length === 0 ? (
            <p className="text-gray-500">Nenhum formulário disponível.</p>
          ) : (
            <div className="space-y-4">
              {templates.map((template) => (
                <DepartmentForm key={template.id} template={template} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}