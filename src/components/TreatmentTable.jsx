import { formatDate } from '../utils/dateUtils.js';

export default function TreatmentTable({
  treatments = [],
  isLoading = false,
  errorMessage = '',
  emptyMessage = 'Ehhez az állathoz még nincs rögzített kezelés.',
  showActions = false,
  onEdit = null,
  onDelete = null
}) {
  if (isLoading) {
    return (
      <div className="loading-state">Kezelések betöltése folyamatban...</div>
    );
  }

  if (errorMessage) {
    return <div className="error-state">{errorMessage}</div>;
  }

  if (!treatments.length) {
    return <div className="empty-state">{emptyMessage}</div>;
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Kezelés neve</th>
            <th scope="col">Dátum</th>
            <th scope="col">Megjegyzés</th>
            {showActions ? <th scope="col">Műveletek</th> : null}
          </tr>
        </thead>
        <tbody>
          {treatments.map((treatment) => (
            <tr key={treatment.id}>
              <td>{treatment.treatment_name}</td>
              <td>{formatDate(treatment.treatment_date)}</td>
              <td>{treatment.notes || 'Nincs megjegyzés'}</td>
              {showActions ? (
                <td>
                  <div className="inline-actions">
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => onEdit && onEdit(treatment)}
                    >
                      Szerkesztés
                    </button>
                    <button
                      type="button"
                      className="button button-danger"
                      onClick={() => onDelete && onDelete(treatment)}
                    >
                      Törlés
                    </button>
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}