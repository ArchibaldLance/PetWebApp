import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimalForm from '../components/AnimalForm.jsx';
import { createAnimal } from '../services/animalsService.js';
import {
  deleteAnimalImageByPath,
  uploadAnimalImage
} from '../services/imageService.js';

export default function AnimalCreatePage() {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    document.title = 'Új állat létrehozása | Háziállat nyilvántartó';
  }, []);

  async function handleCreateAnimal(formData) {
    setIsSubmitting(true);
    setErrorMessage('');

    let uploadedImage = null;

    try {
      if (formData.imageFile) {
        uploadedImage = await uploadAnimalImage(formData.imageFile);
      }

      const createdAnimal = await createAnimal({
        name: formData.name,
        birth_date: formData.birth_date,
        weight: formData.weight,
        color: formData.color,
        sex: formData.sex,
        image_url: uploadedImage ? uploadedImage.publicUrl : null
      });

      navigate(`/admin/animals/${createdAnimal.id}/edit`);
    } catch (error) {
      if (uploadedImage && uploadedImage.path) {
        try {
          await deleteAnimalImageByPath(uploadedImage.path);
        } catch (imageDeleteError) {
          console.error(
            'A feltöltött kép visszatörlése nem sikerült:',
            imageDeleteError
          );
        }
      }

      setErrorMessage(error.message || 'Nem sikerült létrehozni az állatot.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    navigate('/admin');
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Új állat létrehozása</h2>
          <p className="page-description">
            Add meg az állat adatait, majd mentsd el az új rekordot.
          </p>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Állat adatai</h3>

        <AnimalForm
          initialValues={{
            name: '',
            birth_date: '',
            weight: '',
            color: '',
            sex: '',
            image_url: ''
          }}
          onSubmit={handleCreateAnimal}
          submitButtonText="Állat létrehozása"
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          onCancel={handleCancel}
          cancelButtonText="Vissza az admin oldalra"
          showDeleteImageOption={false}
        />
      </div>
    </div>
  );
}