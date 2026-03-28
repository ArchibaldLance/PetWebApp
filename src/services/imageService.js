import { supabase, animalImagesBucket } from '../lib/supabase.js';

function throwSupabaseError(error, fallbackMessage) {
  if (error) {
    throw new Error(error.message || fallbackMessage);
  }
}

function validateImageFile(file) {
  if (!file) {
    throw new Error('Nem lett kiválasztva képfájl.');
  }

  if (!(file instanceof File)) {
    throw new Error('A feltöltendő fájl típusa nem megfelelő.');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Csak képfájl tölthető fel.');
  }
}

function getFileExtension(fileName) {
  const parts = fileName.split('.');
  const extension = parts.length > 1 ? parts.pop() : 'jpg';

  return extension.toLowerCase();
}

function sanitizeFileName(fileName) {
  return fileName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

function buildImagePath(file) {
  const extension = getFileExtension(file.name);
  const safeName = sanitizeFileName(file.name) || 'animal-image';
  const uniqueId = crypto.randomUUID();

  return `animals/${uniqueId}-${safeName}.${extension}`;
}

export function getImagePathFromPublicUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return null;
  }

  const marker = `/object/public/${animalImagesBucket}/`;
  const markerIndex = imageUrl.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  const imagePath = imageUrl.slice(markerIndex + marker.length);

  return decodeURIComponent(imagePath);
}

export async function uploadAnimalImage(file) {
  validateImageFile(file);

  const imagePath = buildImagePath(file);

  const { error: uploadError } = await supabase.storage
    .from(animalImagesBucket)
    .upload(imagePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  throwSupabaseError(uploadError, 'Nem sikerült feltölteni a képet.');

  const { data } = supabase.storage
    .from(animalImagesBucket)
    .getPublicUrl(imagePath);

  if (!data || !data.publicUrl) {
    throw new Error('Nem sikerült létrehozni a kép nyilvános URL-jét.');
  }

  return {
    path: imagePath,
    publicUrl: data.publicUrl
  };
}

export async function deleteAnimalImageByPath(imagePath) {
  if (!imagePath) {
    return;
  }

  const { error } = await supabase.storage
    .from(animalImagesBucket)
    .remove([imagePath]);

  throwSupabaseError(error, 'Nem sikerült törölni a képet a tárhelyről.');
}

export async function deleteAnimalImageByUrl(imageUrl) {
  const imagePath = getImagePathFromPublicUrl(imageUrl);

  if (!imagePath) {
    return;
  }

  await deleteAnimalImageByPath(imagePath);
}

export async function replaceAnimalImage(oldImageUrl, newFile) {
  const uploadedImage = await uploadAnimalImage(newFile);

  try {
    if (oldImageUrl) {
      await deleteAnimalImageByUrl(oldImageUrl);
    }
  } catch (error) {
    console.error('A régi kép törlése nem sikerült:', error);
  }

  return uploadedImage;
}