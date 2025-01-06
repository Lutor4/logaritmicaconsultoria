import { useState, useEffect } from 'react';
import { imageService, type DepartmentImage } from '../../services/images';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ImageGalleryProps {
  departmentId: string;
}

export function ImageGallery({ departmentId }: ImageGalleryProps) {
  const [images, setImages] = useState<DepartmentImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadImages = async () => {
    try {
      const data = await imageService.list(departmentId);
      setImages(data);
    } catch (err) {
      console.error('Error loading images:', err);
      setError('Erro ao carregar imagens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, [departmentId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (images.length === 0) return <p>Nenhuma imagem enviada</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((image) => (
        <div key={image.id} className="relative aspect-square">
          <img
            src={imageService.getPublicUrl(image.url)}
            alt={image.name}
            className="absolute inset-0 w-full h-full object-cover rounded-lg"
          />
        </div>
      ))}
    </div>
  );
}