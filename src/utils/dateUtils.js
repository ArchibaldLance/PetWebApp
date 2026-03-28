export function formatDate(dateString) {
  if (!dateString) {
    return 'Nincs megadva';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return 'Érvénytelen dátum';
  }

  return date.toLocaleDateString('hu-HU');
}

export function calculateAge(birthDateString) {
  if (!birthDateString) {
    return 'Nincs megadva';
  }

  const birthDate = new Date(birthDateString);

  if (Number.isNaN(birthDate.getTime())) {
    return 'Ismeretlen';
  }

  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  const dayDifference = today.getDate() - birthDate.getDate();

  if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
    years -= 1;
  }

  if (years < 0) {
    return 'Ismeretlen';
  }

  if (years === 0) {
    return '0 év';
  }

  if (years === 1) {
    return '1 év';
  }

  return `${years} év`;
}

export function formatDateForInput(dateString) {
  if (!dateString) {
    return '';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function sortByCreatedAtDescending(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return [...items].sort((firstItem, secondItem) => {
    const firstDate = new Date(firstItem.created_at).getTime();
    const secondDate = new Date(secondItem.created_at).getTime();

    return secondDate - firstDate;
  });
}

export function sortByDateDescending(items, fieldName) {
  if (!Array.isArray(items)) {
    return [];
  }

  return [...items].sort((firstItem, secondItem) => {
    const firstDate = new Date(firstItem[fieldName]).getTime();
    const secondDate = new Date(secondItem[fieldName]).getTime();

    return secondDate - firstDate;
  });
}