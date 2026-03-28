import { useEffect, useState } from 'react';
import AnimalTable from '../components/AnimalTable.jsx';
import { getAnimalsForHomePage } from '../services/animalsService.js';

export default function HomePage() {
  const [animals, setAnimals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    document.title = 'Főoldal | Háziállat nyilvántartó';
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadAnimals() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const loadedAnimals = await getAnimalsForHomePage();

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

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h2 className="page-title">Állatok</h2>
          <p className="page-description">
            A táblázatban csak az állatok neve látható. Kattints egy sorra vagy
            a névre a részletek megnyitásához.
          </p>
        </div>
      </div>

      <div className="card">
        <AnimalTable
          animals={animals}
          isLoading={isLoading}
          errorMessage={errorMessage}
          emptyMessage="Még nincs rögzített állat az adatbázisban."
        />
      </div>
    </div>
  );
}