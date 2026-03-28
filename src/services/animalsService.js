import { supabase } from '../lib/supabase.js';

const animalColumns = `
  id,
  name,
  birth_date,
  weight,
  color,
  sex,
  image_url,
  created_at
`;

function normalizeTextValue(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue === '' ? null : trimmedValue;
}

function normalizeWeightValue(value) {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    throw new Error('A súly mező értéke nem megfelelő.');
  }

  return numericValue;
}

function buildAnimalPayload(animalData) {
  const name = normalizeTextValue(animalData.name);

  if (!name) {
    throw new Error('A név megadása kötelező.');
  }

  return {
    name,
    birth_date: animalData.birth_date || null,
    weight: normalizeWeightValue(animalData.weight),
    color: normalizeTextValue(animalData.color),
    sex: normalizeTextValue(animalData.sex),
    image_url: normalizeTextValue(animalData.image_url)
  };
}

function throwSupabaseError(error, fallbackMessage) {
  if (error) {
    throw new Error(error.message || fallbackMessage);
  }
}

export async function getAnimals() {
  const { data, error } = await supabase
    .from('animals')
    .select(animalColumns)
    .order('name', { ascending: true });

  throwSupabaseError(error, 'Nem sikerült lekérni az állatokat.');

  return data || [];
}

export async function getAnimalsForHomePage() {
  const { data, error } = await supabase
    .from('animals')
    .select('id, name')
    .order('name', { ascending: true });

  throwSupabaseError(error, 'Nem sikerült lekérni a főoldali állatlistát.');

  return data || [];
}

export async function getAnimalById(animalId) {
  const { data, error } = await supabase
    .from('animals')
    .select(animalColumns)
    .eq('id', animalId)
    .single();

  throwSupabaseError(error, 'Nem sikerült lekérni az állat adatait.');

  return data;
}

export async function createAnimal(animalData) {
  const payload = buildAnimalPayload(animalData);

  const { data, error } = await supabase
    .from('animals')
    .insert([payload])
    .select(animalColumns)
    .single();

  throwSupabaseError(error, 'Nem sikerült létrehozni az állatot.');

  return data;
}

export async function updateAnimal(animalId, animalData) {
  const payload = buildAnimalPayload(animalData);

  const { data, error } = await supabase
    .from('animals')
    .update(payload)
    .eq('id', animalId)
    .select(animalColumns)
    .single();

  throwSupabaseError(error, 'Nem sikerült frissíteni az állat adatait.');

  return data;
}

export async function deleteAnimal(animalId) {
  const animalToDelete = await getAnimalById(animalId);

  const { error } = await supabase
    .from('animals')
    .delete()
    .eq('id', animalId);

  throwSupabaseError(error, 'Nem sikerült törölni az állatot.');

  return animalToDelete;
}