import { useEffect, useState } from 'react';
import { formatDateForInput } from '../utils/dateUtils.js';

const defaultFormValues = {
  id: null,
  animal_id: '',
  treatment_name: '',
  treatment_date: '',
  notes: ''
};

export default function TreatmentForm({
  animalId = '',
  initialValues = defaultFormValues,
  onSubmit,
  submitButtonText = 'Mentés',
  isSubmitting = false,
  errorMessage = '',
  successMessage = '',
  onCancel = null,
  cancelButtonText = 'Mégse'
}) {
  const [formValues, setFormValues] = useState(defaultFormValues);

  useEffect(() => {
    setFormValues({
      id: initialValues.id ?? null,
      animal_id:
        initialValues.animal_id !== undefined &&
        initialValues.animal_id !== null &&
        initialValues.animal_id !== ''
          ? String(initialValues.animal_id)
          : animalId
            ? String(animalId)
            : '',
      treatment_name: initialValues.treatment_name || '',
      treatment_date: formatDateForInput(initialValues.treatment_date),
      notes: initialValues.notes || ''
    });
  }, [animalId, initialValues]);

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormValues((previousValues) => ({
      ...previousValues,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (typeof onSubmit !== 'function') {
      return;
    }

    await onSubmit({
      animal_id: formValues.animal_id,
      treatment_name: formValues.treatment_name,
      treatment_date: formValues.treatment_date,
      notes: formValues.notes
    });
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {errorMessage ? (
        <div className="message message-error">{errorMessage}</div>
      ) : null}

      {successMessage ? (
        <div className="message message-success">{successMessage}</div>
      ) : null}

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="treatment_name">
            Kezelés neve
          </label>
          <input
            id="treatment_name"
            name="treatment_name"
            type="text"
            className="input"
            value={formValues.treatment_name}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
            autoComplete="off"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="treatment_date">
            Dátum
          </label>
          <input
            id="treatment_date"
            name="treatment_date"
            type="date"
            className="input"
            value={formValues.treatment_date}
            onChange={handleInputChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group form-group-full">
          <label className="form-label" htmlFor="notes">
            Megjegyzés
          </label>
          <textarea
            id="notes"
            name="notes"
            className="textarea"
            value={formValues.notes}
            onChange={handleInputChange}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="button button-success"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Mentés folyamatban...' : submitButtonText}
        </button>

        {typeof onCancel === 'function' ? (
          <button
            type="button"
            className="button button-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {cancelButtonText}
          </button>
        ) : null}
      </div>
    </form>
  );
}