import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import TreatmentTable from '../components/TreatmentTable.jsx';
import { getAnimalById } from '../services/animalsService.js';
import { getTreatmentsByAnimalId } from '../services/treatmentsService.js';
import { calculateAge, formatDate } from '../utils/dateUtils.js';

export default function AnimalDetailPage() {
  const { id } = useParams();

  const [animal, setAnimal] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [isAnimalLoading, setIsAnimalLoading] = useState(true);
  const [isTreatmentsLoading, setIsTreatmentsLoading] = useState(true);
  const [animalErrorMessage, setAnimalErrorMessage] = useState('');
  const [treatmentsErrorMessage, setTreatmentsErrorMessage] = useState('');

  useEffect(() => {
    document.title = 'Állat adatlap | Háziállat nyilvántartó';
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadAnimalDetails() {
      setIsAnimalLoading(true);
      setIsTreatmentsLoading(true);
      setAnimalErrorMessage('');
      setTreatmentsErrorMessage('');

      try {
        const loadedAnimal = await getAnimalById(id);

        if (isMounted) {
          setAnimal(loadedAnimal);
          document.title = `${loadedAnimal.name} | Háziállat nyilvántartó`;
        }
      } catch (error) {
        if (isMounted) {
          setAnimal(null);
          setAnimalErrorMessage(
            error.message || 'Nem sikerült betölteni az állat adatait.'
          );
        }
      } finally {
        if (isMounted) {
          setIsAnimalLoading(false);
        }
      }

      try {
        const loadedTreatments = await getTreatmentsByAnimalId(id);

        if (isMounted) {
          setTreatments(loadedTreatments);
        }
      } catch (error) {
        if (isMounted) {
          setTreatments([]);
          setTreatmentsErrorMessage(
            error.message || 'Nem sikerült betölteni a kezelések listáját.'
          );
        }
      } finally {
        if (isMounted) {
          setIsTreatmentsLoading(false);
        }
      }
    }

    loadAnimalDetails();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isAnimalLoading) {
    return (
      <div className="container">
        <div className="loading-state">Állat adatainak betöltése folyamatban...</div>
      </div>
    );
  }

  if (animalErrorMessage) {
    return (
      <div className="container">
        <div className="page-header">
          <div>
            <h2 className="page-title">Állat adatlap</h2>
            <p className="page-description">
              A részletek megjelenítése nem sikerült.
            </p>
          </div>
        </div>

        <div className="message message-error">{animalErrorMessage}</div>

        <div className="action-group" style={{ marginTop: '1rem' }}>
          <Link to="/" className="button button-secondary">
            Vissza a főoldalra
          </Link>
          <Link to="/admin" className="button button-link">
            Admin oldal megnyitása
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
            <h2 className="page-title">Állat adatlap</h2>
            <p className="page-description">
              A keresett állat nem található.
            </p>
          </div>
        </div>

        <div className="empty-state">Nincs megjeleníthető állatadat.</div>

        <div className="action-group" style={{ marginTop: '1rem' }}>
          <Link to="/" className="button button-secondary">
            Vissza a főoldalra
          </Link>
        </div>
      </div>
    );
  }

  const ageText = calculateAge(animal.birth_date);
  const birthDateText = formatDate(animal.birth_date);
  const weightText =
    animal.weight === null || animal.weight === undefined
      ? 'Nincs megadva'
      : `${animal.weight} kg`;

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h2 className="page-title">{animal.name}</h2>
          <p className="page-description">
            Részletes adatlap és a hozzá tartozó kezelések listája.
          </p>
        </div>

        <div className="action-group">
          <Link to="/" className="button button-secondary">
            Vissza a főoldalra
          </Link>
          <Link
            to={`/admin/animals/${animal.id}/edit`}
            className="button button-primary"
          >
            Szerkesztés
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="details-grid">
          <div className="image-panel">
            {animal.image_url ? (
              <img
                src={animal.image_url}
                alt={`${animal.name} képe`}
                className="animal-image"
              />
            ) : (
              <div className="image-placeholder">Ehhez az állathoz nincs feltöltött kép.</div>
            )}
          </div>

          <div>
            <h3 className="section-title">Állat adatai</h3>

            <div className="data-list">
              <div className="data-label">Név</div>
              <div className="data-value">{animal.name}</div>

              <div className="data-label">Születési dátum</div>
              <div className="data-value">{birthDateText}</div>

              <div className="data-label">Életkor</div>
              <div className="data-value">{ageText}</div>

              <div className="data-label">Súly</div>
              <div className="data-value">{weightText}</div>

              <div className="data-label">Szín</div>
              <div className="data-value">{animal.color || 'Nincs megadva'}</div>

              <div className="data-label">Nem</div>
              <div className="data-value">{animal.sex || 'Nincs megadva'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Kezelések</h3>
        <TreatmentTable
          treatments={treatments}
          isLoading={isTreatmentsLoading}
          errorMessage={treatmentsErrorMessage}
          emptyMessage="Ehhez az állathoz még nincs rögzített kezelés."
        />
      </div>
    </div>
  );
}