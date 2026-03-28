import { supabase } from '../lib/supabase.js';

const treatmentColumns = `
  id,
  animal_id,
  treatment_name,
  treatment_date,
  notes,
  created_at
`;

function normalizeTextValue(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue === '' ? null : trimmedValue;
}

function normalizeAnimalId(value) {
  if (value === null || value === undefined || value === '') {
    throw new Error('Az állat azonosítója kötelező.');
  }

  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    throw new Error('Az állat azonosítója nem megfelelő.');
  }

  return numericValue;
}

function buildTreatmentPayload(treatmentData) {
  const treatmentName = normalizeTextValue(treatmentData.treatment_name);

  if (!treatmentName) {
    throw new Error('A kezelés neve kötelező.');
  }

  return {
    animal_id: normalizeAnimalId(treatmentData.animal_id),
    treatment_name: treatmentName,
    treatment_date: treatmentData.treatment_date || null,
    notes: normalizeTextValue(treatmentData.notes)
  };
}

function throwSupabaseError(error, fallbackMessage) {
  if (error) {
    throw new Error(error.message || fallbackMessage);
  }
}

export async function getTreatmentsByAnimalId(animalId) {
  const normalizedAnimalId = normalizeAnimalId(animalId);

  const { data, error } = await supabase
    .from('treatments')
    .select(treatmentColumns)
    .eq('animal_id', normalizedAnimalId)
    .order('treatment_date', { ascending: false })
    .order('created_at', { ascending: false });

  throwSupabaseError(error, 'Nem sikerült lekérni a kezeléseket.');

  return data || [];
}

export async function getTreatmentById(treatmentId) {
  const { data, error } = await supabase
    .from('treatments')
    .select(treatmentColumns)
    .eq('id', treatmentId)
    .single();

  throwSupabaseError(error, 'Nem sikerült lekérni a kezelés adatait.');

  return data;
}

export async function createTreatment(treatmentData) {
  const payload = buildTreatmentPayload(treatmentData);

  const { data, error } = await supabase
    .from('treatments')
    .insert([payload])
    .select(treatmentColumns)
    .single();

  throwSupabaseError(error, 'Nem sikerült létrehozni a kezelést.');

  return data;
}

export async function updateTreatment(treatmentId, treatmentData) {
  const payload = buildTreatmentPayload(treatmentData);

  const { data, error } = await supabase
    .from('treatments')
    .update(payload)
    .eq('id', treatmentId)
    .select(treatmentColumns)
    .single();

  throwSupabaseError(error, 'Nem sikerült frissíteni a kezelést.');

  return data;
}

export async function deleteTreatment(treatmentId) {
  const treatmentToDelete = await getTreatmentById(treatmentId);

  const { error } = await supabase
    .from('treatments')
    .delete()
    .eq('id', treatmentId);

  throwSupabaseError(error, 'Nem sikerült törölni a kezelést.');

  return treatmentToDelete;
}