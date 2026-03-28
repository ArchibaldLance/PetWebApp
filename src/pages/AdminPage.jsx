import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteAnimal, getAnimals } from '../services/animalsService.js';
import { deleteAnimalImageByUrl } from '../services/imageService.js';
import { formatDate } from '../utils/dateUtils.js';

export default function AdminPage() {
  const [animals, setAnimals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deletingAnimalId, setDeletingAnimalId] = useState(null);

  useEffect(() => {
    document.title = 'Admin | Háziállat nyilvántartó';
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadAnimals() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const loadedAnimals = await getAnimals();

        if (isMounted) {
          setAnimals(loadedAnimals);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error.message || 'Nem sikerült betölteni az állatok listáját.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAnimals();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleDeleteAnimal(animal) {
    const confirmed = window.confirm(
      `Biztosan törölni szeretnéd ezt az állatot: ${animal.name}? A hozzá tartozó kezelések is törlődnek.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingAnimalId(animal.id);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const deletedAnimal = await deleteAnimal(animal.id);

      if (deletedAnimal.image_url) {
        try {
          await deleteAnimalImageByUrl(deletedAnimal.image_url);
        } catch (imageError) {
          console.error('A kép törlése nem sikerült:', imageError);
        }
      }

      setAnimals((previousAnimals) =>
        previousAnimals.filter((currentAnimal) => currentAnimal.id !== animal.id)
      );

      setSuccessMessage(`Az állat sikeresen törölve lett: ${animal.name}.`);
    } catch (error) {
      setErrorMessage(error.message || 'Nem sikerült törölni az állatot.');
    } finally {
      setDeletingAnimalId(null);
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Admin felület</h2>
          <p className="page-description">
            Itt lehet új állatot létrehozni, meglévő állatot szerkeszteni, illetve
            törölni.
          </p>
        </div>

        <div className="action-group">
          <Link to="/admin/new" className="button button-primary">
            Új állat hozzáadása
          </Link>
          <Link to="/" className="button button-secondary">
            Vissza a főoldalra
          </Link>
        </div>
      </div>

      {errorMessage ? (
        <div className="message message-error" style={{ marginBottom: '1rem' }}>
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="message message-success" style={{ marginBottom: '1rem' }}>
          {successMessage}
        </div>
      ) : null}

      <div className="card">
        <h3 className="section-title">Állatok kezelése</h3>

        {isLoading ? (
          <div className="loading-state">Állatok betöltése folyamatban...</div>
        ) : null}

        {!isLoading && !animals.length ? (
          <div className="empty-state">
            Még nincs rögzített állat. Az első állat hozzáadásához kattints az
            „Új állat hozzáadása” gombra.
          </div>
        ) : null}

        {!isLoading && animals.length ? (
          <div className="admin-list">
            {animals.map((animal) => {
              const isDeleting = deletingAnimalId === animal.id;

              return (
                <div key={animal.id} className="admin-list-item">
                  <div>
                    <p className="admin-list-item-title">{animal.name}</p>
                    <p className="admin-list-item-meta">
                      Születési dátum: {formatDate(animal.birth_date)}
                    </p>
                  </div>

                  <div className="inline-actions">
                    <Link
                      to={`/animals/${animal.id}`}
                      className="button button-link"
                    >
                      Adatlap
                    </Link>

                    <Link
                      to={`/admin/animals/${animal.id}/edit`}
                      className="button button-secondary"
                    >
                      Szerkesztés
                    </Link>

                    <button
                      type="button"
                      className="button button-danger"
                      onClick={() => handleDeleteAnimal(animal)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Törlés folyamatban...' : 'Törlés'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}