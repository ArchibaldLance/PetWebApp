import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AnimalForm from '../components/AnimalForm.jsx';
import TreatmentForm from '../components/TreatmentForm.jsx';
import TreatmentTable from '../components/TreatmentTable.jsx';
import {
  deleteAnimal,
  getAnimalById,
  updateAnimal
} from '../services/animalsService.js';
import {
  deleteAnimalImageByPath,
  deleteAnimalImageByUrl,
  uploadAnimalImage
} from '../services/imageService.js';
import {
  createTreatment,
  deleteTreatment,
  getTreatmentsByAnimalId,
  updateTreatment
} from '../services/treatmentsService.js';

const emptyTreatmentFormValues = {
  id: null,
  animal_id: '',
  treatment_name: '',
  treatment_date: '',
  notes: ''
};

export default function AnimalEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [animal, setAnimal] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isTreatmentsLoading, setIsTreatmentsLoading] = useState(true);

  const [animalErrorMessage, setAnimalErrorMessage] = useState('');
  const [animalSuccessMessage, setAnimalSuccessMessage] = useState('');

  const [treatmentErrorMessage, setTreatmentErrorMessage] = useState('');
  const [treatmentSuccessMessage, setTreatmentSuccessMessage] = useState('');

  const [isAnimalSubmitting, setIsAnimalSubmitting] = useState(false);
  const [isAnimalDeleting, setIsAnimalDeleting] = useState(false);
  const [isTreatmentSubmitting, setIsTreatmentSubmitting] = useState(false);
  const [deletingTreatmentId, setDeletingTreatmentId] = useState(null);

  const [editingTreatment, setEditingTreatment] = useState(null);

  useEffect(() => {
    document.title = 'Állat szerkesztése | Háziállat nyilvántartó';
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadPageData() {
      setIsPageLoading(true);
      setIsTreatmentsLoading(true);
      setAnimalErrorMessage('');
      setTreatmentErrorMessage('');

      try {
        const loadedAnimal = await getAnimalById(id);

        if (!isMounted) {
          return;
        }

        setAnimal(loadedAnimal);
        document.title = `${loadedAnimal.name} szerkesztése | Háziállat nyilvántartó`;

        try {
          const loadedTreatments = await getTreatmentsByAnimalId(id);

          if (isMounted) {
            setTreatments(loadedTreatments);
          }
        } catch (error) {
          if (isMounted) {
            setTreatments([]);
            setTreatmentErrorMessage(
              error.message || 'Nem sikerült betölteni a kezeléseket.'
            );
          }
        } finally {
          if (isMounted) {
            setIsTreatmentsLoading(false);
          }
        }
      } catch (error) {
        if (isMounted) {
          setAnimal(null);
          setTreatments([]);
          setIsTreatmentsLoading(false);
          setAnimalErrorMessage(
            error.message || 'Nem sikerült betölteni az állat adatait.'
          );
        }
      } finally {
        if (isMounted) {
          setIsPageLoading(false);
        }
      }
    }

    loadPageData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  async function refreshTreatments() {
    try {
      const loadedTreatments = await getTreatmentsByAnimalId(id);
      setTreatments(loadedTreatments);
      setTreatmentErrorMessage('');
    } catch (error) {
      setTreatments([]);
      setTreatmentErrorMessage(
        error.message || 'Nem sikerült frissíteni a kezelések listáját.'
      );
    }
  }

  async function handleUpdateAnimal(formData) {
    if (!animal) {
      return;
    }

    setIsAnimalSubmitting(true);
    setAnimalErrorMessage('');
    setAnimalSuccessMessage('');

    let uploadedImage = null;
    const previousImageUrl = animal.image_url || null;
    let nextImageUrl = previousImageUrl;

    try {
      if (formData.imageFile) {
        uploadedImage = await uploadAnimalImage(formData.imageFile);
        nextImageUrl = uploadedImage.publicUrl;
      } else if (formData.removeImage) {
        nextImageUrl = null;
      }

      const updatedAnimal = await updateAnimal(animal.id, {
        name: formData.name,
        birth_date: formData.birth_date,
        weight: formData.weight,
        color: formData.color,
        sex: formData.sex,
        image_url: nextImageUrl
      });

      setAnimal(updatedAnimal);
      setAnimalSuccessMessage('Az állat adatai sikeresen frissítve lettek.');

      if (formData.imageFile && previousImageUrl) {
        try {
          await deleteAnimalImageByUrl(previousImageUrl);
        } catch (imageDeleteError) {
          console.error('A régi kép törlése nem sikerült:', imageDeleteError);
        }
      }

      if (formData.removeImage && previousImageUrl) {
        try {
          await deleteAnimalImageByUrl(previousImageUrl);
        } catch (imageDeleteError) {
          console.error('A kép törlése nem sikerült:', imageDeleteError);
        }
      }
    } catch (error) {
      if (uploadedImage && uploadedImage.path) {
        try {
          await deleteAnimalImageByPath(uploadedImage.path);
        } catch (imageRollbackError) {
          console.error(
            'Az újonnan feltöltött kép visszatörlése nem sikerült:',
            imageRollbackError
          );
        }
      }

      setAnimalErrorMessage(
        error.message || 'Nem sikerült frissíteni az állat adatait.'
      );
    } finally {
      setIsAnimalSubmitting(false);
    }
  }

  async function handleDeleteAnimal() {
    if (!animal) {
      return;
    }

    const confirmed = window.confirm(
      `Biztosan törölni szeretnéd ezt az állatot: ${animal.name}? A hozzá tartozó kezelések is törlődnek.`
    );

    if (!confirmed) {
      return;
    }

    setIsAnimalDeleting(true);
    setAnimalErrorMessage('');
    setAnimalSuccessMessage('');

    try {
      const deletedAnimal = await deleteAnimal(animal.id);

      if (deletedAnimal.image_url) {
        try {
          await deleteAnimalImageByUrl(deletedAnimal.image_url);
        } catch (imageDeleteError) {
          console.error('A kép törlése nem sikerült:', imageDeleteError);
        }
      }

      navigate('/admin');
    } catch (error) {
      setAnimalErrorMessage(error.message || 'Nem sikerült törölni az állatot.');
      setIsAnimalDeleting(false);
    }
  }

  async function handleSubmitTreatment(formData) {
    if (!animal) {
      return;
    }

    setIsTreatmentSubmitting(true);
    setTreatmentErrorMessage('');
    setTreatmentSuccessMessage('');

    try {
      const payload = {
        animal_id: animal.id,
        treatment_name: formData.treatment_name,
        treatment_date: formData.treatment_date,
        notes: formData.notes
      };

      if (editingTreatment) {
        await updateTreatment(editingTreatment.id, payload);
        setTreatmentSuccessMessage('A kezelés sikeresen frissítve lett.');
      } else {
        await createTreatment(payload);
        setTreatmentSuccessMessage('A kezelés sikeresen rögzítve lett.');
      }

      await refreshTreatments();
      setEditingTreatment(null);
    } catch (error) {
      setTreatmentErrorMessage(
        error.message || 'Nem sikerült menteni a kezelés adatait.'
      );
    } finally {
      setIsTreatmentSubmitting(false);
    }
  }

  async function handleDeleteTreatment(treatment) {
    const confirmed = window.confirm(
      `Biztosan törölni szeretnéd ezt a kezelést: ${treatment.treatment_name}?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingTreatmentId(treatment.id);
    setTreatmentErrorMessage('');
    setTreatmentSuccessMessage('');

    try {
      await deleteTreatment(treatment.id);

      setTreatments((previousTreatments) =>
        previousTreatments.filter(
          (currentTreatment) => currentTreatment.id !== treatment.id
        )
      );

      if (editingTreatment && editingTreatment.id === treatment.id) {
        setEditingTreatment(null);
      }

      setTreatmentSuccessMessage('A kezelés sikeresen törölve lett.');
    } catch (error) {
      setTreatmentErrorMessage(
        error.message || 'Nem sikerült törölni a kezelést.'
      );
    } finally {
      setDeletingTreatmentId(null);
    }
  }

  function handleEditTreatment(treatment) {
    setEditingTreatment(treatment);
    setTreatmentErrorMessage('');
    setTreatmentSuccessMessage('');
  }

  function handleCancelTreatmentEdit() {
    setEditingTreatment(null);
    setTreatmentErrorMessage('');
    setTreatmentSuccessMessage('');
  }

  if (isPageLoading) {
    return (
      <div className="container">
        <div className="loading-state">
          Állat adatainak betöltése folyamatban...
        </div>
      </div>
    );
  }

  if (animalErrorMessage && !animal) {
    return (
      <div className="container">
        <div className="page-header">
          <div>
            <h2 className="page-title">Állat szerkesztése</h2>
            <p className="page-description">
              Az oldal nem tudta betölteni a kért állat adatait.
            </p>
          </div>
        </div>

        <div className="message message-error">{animalErrorMessage}</div>

        <div className="action-group" style={{ marginTop: '1rem' }}>
          <Link to="/admin" className="button button-secondary">
            Vissza az admin oldalra
          </Link>
          <Link to="/" className="button button-link">
            Vissza a főoldalra
          </Link>
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="container">
        <div className="page-header">
          <div>
            <h2 className="page-title">Állat szerkesztése</h2>
            <p className="page-description">
              A keresett állat nem található.
            </p>
          </div>
        </div>

        <div className="empty-state">Nincs megjeleníthető állatadat.</div>

        <div className="action-group" style={{ marginTop: '1rem' }}>
          <Link to="/admin" className="button button-secondary">
            Vissza az admin oldalra
          </Link>
        </div>
      </div>
    );
  }

  const isDeletingAnyTreatment = deletingTreatmentId !== null;

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h2 className="page-title">{animal.name} szerkesztése</h2>
          <p className="page-description">
            Itt módosíthatod az állat adatait, valamint kezelheted a hozzá tartozó
            kezeléseket.
          </p>
        </div>

        <div className="action-group">
          <Link to={`/animals/${animal.id}`} className="button button-link">
            Adatlap megnyitása
          </Link>
          <Link to="/admin" className="button button-secondary">
            Vissza az admin oldalra
          </Link>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Állat adatainak szerkesztése</h3>

        <AnimalForm
          initialValues={animal}
          onSubmit={handleUpdateAnimal}
          submitButtonText="Állat adatainak mentése"
          isSubmitting={isAnimalSubmitting}
          errorMessage={animalErrorMessage}
          successMessage={animalSuccessMessage}
          onCancel={() => navigate('/admin')}
          cancelButtonText="Vissza az admin oldalra"
          showDeleteImageOption={true}
        />

        <div className="action-group" style={{ marginTop: '1rem' }}>
          <button
            type="button"
            className="button button-danger"
            onClick={handleDeleteAnimal}
            disabled={isAnimalDeleting || isAnimalSubmitting}
          >
            {isAnimalDeleting ? 'Törlés folyamatban...' : 'Állat törlése'}
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Kezelések</h3>

        {isDeletingAnyTreatment ? (
          <div className="message message-info" style={{ marginBottom: '1rem' }}>
            Kezelés törlése folyamatban...
          </div>
        ) : null}

        <TreatmentTable
          treatments={treatments}
          isLoading={isTreatmentsLoading}
          errorMessage={treatmentErrorMessage}
          emptyMessage="Ehhez az állathoz még nincs rögzített kezelés."
          showActions={true}
          onEdit={handleEditTreatment}
          onDelete={handleDeleteTreatment}
        />
      </div>

      <div className="card">
        <h3 className="section-title">
          {editingTreatment ? 'Kezelés szerkesztése' : 'Új kezelés hozzáadása'}
        </h3>

        <TreatmentForm
          animalId={animal.id}
          initialValues={editingTreatment || emptyTreatmentFormValues}
          onSubmit={handleSubmitTreatment}
          submitButtonText={editingTreatment ? 'Kezelés mentése' : 'Kezelés hozzáadása'}
          isSubmitting={isTreatmentSubmitting}
          errorMessage={treatmentErrorMessage}
          successMessage={treatmentSuccessMessage}
          onCancel={editingTreatment ? handleCancelTreatmentEdit : null}
          cancelButtonText="Szerkesztés megszakítása"
        />
      </div>
    </div>
  );
}