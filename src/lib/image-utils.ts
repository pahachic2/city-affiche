// Утилиты для работы с изображениями в Base64 формате

// Поддерживаемые MIME типы изображений
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif'
] as const;

// Максимальный размер файла в байтах (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Максимальный размер Base64 строки (примерно 7MB)
export const MAX_BASE64_SIZE = 7 * 1024 * 1024;

/**
 * Конвертирует файл в Base64 строку
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Ошибка чтения файла'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Ошибка чтения файла'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Валидирует файл изображения
 */
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // Проверка типа файла
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      isValid: false,
      error: 'Поддерживаются только форматы: JPEG, PNG, WebP, GIF'
    };
  }
  
  // Проверка размера файла
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `Размер файла не должен превышать ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(1)}MB`
    };
  }
  
  return { isValid: true };
};

/**
 * Извлекает MIME тип из Base64 строки
 */
export const getImageMimeType = (base64: string): string | null => {
  const match = base64.match(/^data:([^;]+);base64,/);
  return match ? match[1] : null;
};

/**
 * Проверяет, является ли строка валидной Base64 строкой изображения
 */
export const isValidBase64Image = (base64: string): boolean => {
  // Проверяем формат data:image/...;base64,...
  if (!base64.startsWith('data:image/')) {
    return false;
  }
  
  const mimeType = getImageMimeType(base64);
  if (!mimeType || !SUPPORTED_IMAGE_TYPES.includes(mimeType as any)) {
    return false;
  }
  
  // Проверяем размер
  if (base64.length > MAX_BASE64_SIZE) {
    return false;
  }
  
  return true;
};

/**
 * Рассчитывает приблизительный размер декодированного изображения в байтах
 */
export const getBase64Size = (base64: string): number => {
  // Убираем префикс data:image/...;base64,
  const base64Data = base64.split(',')[1] || base64;
  
  // Рассчитываем размер: каждые 4 символа Base64 = 3 байта данных
  // Учитываем padding (символы =)
  const padding = (base64Data.match(/=/g) || []).length;
  const dataLength = base64Data.length;
  
  return Math.floor((dataLength * 3) / 4) - padding;
};

/**
 * Сжимает изображение до указанного качества (только для JPEG/WebP)
 */
export const compressImage = (
  file: File, 
  quality: number = 0.8, 
  maxWidth: number = 1920, 
  maxHeight: number = 1080
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Рассчитываем новые размеры с сохранением пропорций
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Рисуем изображение на canvas
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Определяем формат вывода
      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      
      // Конвертируем в Base64 с сжатием
      const base64 = canvas.toDataURL(outputType, quality);
      resolve(base64);
    };
    
    img.onerror = () => {
      reject(new Error('Ошибка загрузки изображения'));
    };
    
    // Загружаем файл в Image
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Создает превью изображения
 */
export const createImagePreview = (base64: string): HTMLImageElement => {
  const img = document.createElement('img');
  img.src = base64;
  img.style.maxWidth = '200px';
  img.style.maxHeight = '150px';
  img.style.objectFit = 'cover';
  img.style.borderRadius = '8px';
  return img;
}; 