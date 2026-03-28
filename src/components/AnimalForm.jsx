import { useEffect, useMemo, useState } from 'react';
import { formatDateForInput } from '../utils/dateUtils.js';

const defaultFormValues = {
  name: '',
  birth_date: '',
  weight: '',
  color: '',
  sex: '',
  image_url: ''
};

export default function AnimalForm({
  initialValues = defaultFormValues,
  onSubmit,
  submitButtonText = 'Mentés',
  isSubmitting = false,
  errorMessage = '',
  successMessage = '',
  onCancel = null,
  cancelButtonText = 'Mégse',
  showDeleteImageOption = true
}) {
  const [formValues, setFormValues] = useState(defaultFormValues);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);

  useEffect(() => {
    setFormValues({
      name: initialValues.name || '',
      birth_date: formatDateForInput(initialValues.birth_date),
      weight:
        initialValues.weight === null || initialValues.weight === undefined
          ? ''
          : String(initialValues.weight),
      color: initialValues.color || '',
      sex: initialValues.sex || '',
      image_url: initialValues.image_url || ''
    });

    setSelectedImageFile(null);
    setRemoveCurrentImage(false);
  }, [initialValues]);

  const selectedImagePreviewUrl = useMemo(() => {
    if (!selectedImageFile) {
      return '';
    }

    return URL.createObjectURL(selectedImageFile);
  }, [selectedImageFile]);

  useEffect(() => {
    return () => {
      if (selectedImagePreviewUrl) {
        URL.revokeObjectURL(selectedImagePreviewUrl);
      }
    };
  }, [selectedImagePreviewUrl]);

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormValues((previousValues) => ({
      ...previousValues,
      [name]: value
    }));
  }

  function handleImageChange(event) {
    const file = event.target.files && event.target.files[0] ? event.target.files[0] : null;

    setSelectedImageFile(file);

    if (file) {
      setRemoveCurrentImage(false);
    }
  }

  function handleRemoveImageChange(event) {
    const isChecked = event.target.checked;

    setRemoveCurrentImage(isChecked);

    if (isChecked) {
      setSelectedImageFile(null);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (typeof onSubmit !== 'function') {
      return;
    }

    await onSubmit({
      name: formValues.name,
      birth_date: formValues.birth_date,
      weight: formValues.weight,
      color: formValues.color,
      sex: formValues.sex,
      image_url: formValues.image_url,
      imageFile: selectedImageFile,
      removeImage: removeCurrentImage
    });
  }

  const currentImageUrl = formValues.image_url;
  const shouldShowCurrentImage =
    currentImageUrl && !selectedImageFile && !removeCurrentImage;
  const shouldShowSelectedPreview = Boolean(selectedImagePreviewUrl);

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
          <label className="form-label" htmlFor="name">
            Név
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="input"
            value={formValues.name}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
            autoComplete="off"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="birth_date">
            Születési dátum
          </label>
          <input
            id="birth_date"
            name="birth_date"
            type="date"
            className="input"
            value={formValues.birth_date}
            onChange={handleInputChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="weight">
            Súly
          </label>
          <input
            id="weight"
            name="weight"
            type="number"
            step="0.01"
            min="0"
            className="input"
            value={formValues.weight}
            onChange={handleInputChange}
            disabled={isSubmitting}
          />
          <p className="form-help">Példa: 4.5</p>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="color">
            Szín
          </label>
          <input
            id="color"
            name="color"
            type="text"
            className="input"
            value={formValues.color}
            onChange={handleInputChange}
            disabled={isSubmitting}
            autoComplete="off"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="sex">
            Nem
          </label>
          <select
            id="sex"
            name="sex"
            className="select"
            value={formValues.sex}
            onChange={handleInputChange}
            disabled={isSubmitting}
          >
            <option value="">Válassz nemet</option>
            <option value="Hím">Hím</option>
            <option value="Nőstény">Nőstény</option>
            <option value="Ismeretlen">Ismeretlen</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="imageFile">
            Kép feltöltése
          </label>
          <input
            id="imageFile"
            name="imageFile"
            type="file"
            accept="image/*"
            className="file-input"
            onChange={handleImageChange}
            disabled={isSubmitting}
          />
          <p className="form-help">
            A kép Supabase Storage tárhelyre kerül feltöltésre.
          </p>
        </div>

        <div className="form-group form-group-full">
          <p className="form-label">Kép előnézet</p>

          {shouldShowSelectedPreview ? (
            <img
              src={selectedImagePreviewUrl}
              alt="Újonnan kiválasztott állatkép előnézete"
              className="animal-image"
            />
          ) : null}

          {shouldShowCurrentImage ? (
            <img
              src={currentImageUrl}
              alt={`${formValues.name || 'Az állat'} jelenlegi képe`}
              className="animal-image"
            />
          ) : null}

          {!shouldShowSelectedPreview && !shouldShowCurrentImage ? (
            <div className="image-placeholder">Jelenleg nincs feltöltött kép.</div>
          ) : null}
        </div>

        {showDeleteImageOption && currentImageUrl ? (
          <div className="form-group form-group-full">
            <label className="form-label" htmlFor="removeCurrentImage">
              Kép eltávolítása
            </label>
            <label htmlFor="removeCurrentImage">
              <input
                id="removeCurrentImage"
                name="removeCurrentImage"
                type="checkbox"
                checked={removeCurrentImage}
                onChange={handleRemoveImageChange}
                disabled={isSubmitting || Boolean(selectedImageFile)}
              />{' '}
              A jelenlegi kép törlése
            </label>
            {selectedImageFile ? (
              <p className="form-help">
                Új kép kiválasztása esetén a régi kép automatikusan lecserélődik.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="button button-primary"
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