import { useState } from 'react';
import { imageService } from '../../services/images';
import { Upload } from 'lucide-react';

interface ImageUploadProps {
  departmentId: string;
  onSuccess?: () => void;
}

export function ImageUpload({ departmentId, onSuccess }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    setUploading(true);
    setError('');
    setSuccess('');

    try {
      await imageService.upload(departmentId, file);
      setSuccess('Imagem enviada com sucesso!');
      onSuccess?.();
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-500 p-3 rounded-md text-sm">
          {success}
        </div>
      )}

      <label className="block">
        <span className="sr-only">Escolher arquivo</span>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <span>Upload de arquivo</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
              <p className="pl-1">ou arraste e solte</p>
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF até 10MB
            </p>
          </div>
        </div>
      </label>
    </div>
  );
}