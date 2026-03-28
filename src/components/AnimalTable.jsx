import { Link, useNavigate } from 'react-router-dom';

export default function AnimalTable({
  animals = [],
  isLoading = false,
  errorMessage = '',
  emptyMessage = 'Még nincs rögzített állat.'
}) {
  const navigate = useNavigate();

  function openAnimalDetails(animalId) {
    navigate(`/animals/${animalId}`);
  }

  function handleRowKeyDown(event, animalId) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openAnimalDetails(animalId);
    }
  }

  if (isLoading) {
    return <div className="loading-state">Állatok betöltése folyamatban...</div>;
  }

  if (errorMessage) {
    return <div className="error-state">{errorMessage}</div>;
  }

  if (!animals.length) {
    return <div className="empty-state">{emptyMessage}</div>;
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Név</th>
          </tr>
        </thead>
        <tbody>
          {animals.map((animal) => (
            <tr
              key={animal.id}
              className="clickable-row"
              onClick={() => openAnimalDetails(animal.id)}
              onKeyDown={(event) => handleRowKeyDown(event, animal.id)}
              tabIndex={0}
              aria-label={`${animal.name} adatlapjának megnyitása`}
            >
              <td>
                <Link
                  to={`/animals/${animal.id}`}
                  className="name-link"
                  onClick={(event) => event.stopPropagation()}
                >
                  {animal.name}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}