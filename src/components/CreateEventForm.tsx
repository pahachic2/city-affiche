'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { EVENT_CATEGORIES } from '@/types';
import { 
  fileToBase64, 
  validateImageFile, 
  compressImage,
  getBase64Size,
  MAX_FILE_SIZE 
} from '@/lib/image-utils';

interface CreateEventFormProps {
  city: string; // Название города для отображения
  citySlug: string; // Slug города для перенаправления
}

export default function CreateEventForm({ city, citySlug }: CreateEventFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    imageType: '',
    category: 'Частное', // Дефолтная категория
    date: '',
    time: '',
    isOnline: false,
    isRecurring: false,
    recurringType: 'weekly' as 'weekly' | 'monthly',
    recurringEndDate: '',
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageSize, setImageSize] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token } = useAuth();
  const router = useRouter();

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Название обязательно';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Название не должно превышать 200 символов';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Описание не должно превышать 2000 символов';
    }

    if (!formData.category) {
      newErrors.category = 'Выберите категорию';
    }

    if (!formData.date) {
      newErrors.date = 'Дата обязательна';
    } else {
      const eventDate = new Date(formData.date + (formData.time ? `T${formData.time}` : ''));
      if (eventDate <= new Date()) {
        newErrors.date = 'Дата должна быть в будущем';
      }
    }

    if (formData.time && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.time)) {
      newErrors.time = 'Неверный формат времени (ЧЧ:ММ)';
    }

    if (formData.isRecurring) {
      if (!formData.recurringEndDate) {
        newErrors.recurringEndDate = 'Укажите дату окончания повторений';
      } else {
        const endDate = new Date(formData.recurringEndDate);
        const startDate = new Date(formData.date);
        if (endDate <= startDate) {
          newErrors.recurringEndDate = 'Дата окончания должна быть позже даты события';
        }
      }
    }

    // Проверка размера изображения
    if (formData.image && imageSize > MAX_FILE_SIZE * 1.4) { // Base64 примерно на 33% больше
      newErrors.image = 'Изображение слишком большое. Попробуйте сжать или выберите другое.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработка изменения обычных полей
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));

    // Очищаем ошибки при изменении поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Обработка загрузки изображения
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Валидация файла
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, image: validation.error || 'Ошибка файла' }));
      return;
    }

    setIsCompressing(true);
    setErrors(prev => ({ ...prev, image: '' }));

    try {
      let base64: string;
      
      // Если файл больше 2MB, сжимаем его
      if (file.size > 2 * 1024 * 1024) {
        base64 = await compressImage(file, 0.8, 1920, 1080);
      } else {
        base64 = await fileToBase64(file);
      }

      const size = getBase64Size(base64);
      
      setFormData(prev => ({
        ...prev,
        image: base64,
        imageType: file.type,
      }));
      
      setImagePreview(base64);
      setImageSize(size);
      
    } catch {
      setErrors(prev => ({ 
        ...prev, 
        image: 'Ошибка обработки изображения. Попробуйте другой файл.' 
      }));
    } finally {
      setIsCompressing(false);
    }
  };

  // Удаление изображения
  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: '',
      imageType: '',
    }));
    setImagePreview('');
    setImageSize(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Подготавливаем данные для отправки
      const submitData = {
        ...formData,
        city, // Используем название города для API
        date: formData.date + (formData.time ? `T${formData.time}` : ''),
        recurringEndDate: formData.isRecurring ? formData.recurringEndDate : undefined,
        recurringType: formData.isRecurring ? formData.recurringType : undefined,
      };

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        // Успешно создано - используем citySlug для перенаправления
        // Можно добавить toast уведомление здесь
        router.push(`/city/${citySlug}`);
      } else {
        setErrors({ submit: data.error || 'Ошибка создания мероприятия' });
      }
    } catch {
      setErrors({ submit: 'Произошла ошибка. Попробуйте еще раз.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Форматирование размера файла
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-6 lg:p-8">
      {/* Заголовок */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 text-center sm:text-left">
          Создать мероприятие
        </h1>
        <p className="text-gray-500 text-sm text-center sm:text-left">
          Город: <span className="font-medium">{city}</span>
        </p>
      </div>

      {/* Форма */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Общая ошибка */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {errors.submit}
          </div>
        )}

        {/* Название */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Название мероприятия *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Например: День рождения Анны"
            maxLength={200}
          />
          <div className="flex justify-between mt-1">
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
            <p className="text-xs text-gray-500 ml-auto">
              {formData.title.length}/200
            </p>
          </div>
        </div>

        {/* Описание */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Описание *
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Расскажите о вашем мероприятии..."
            maxLength={2000}
          />
          <div className="flex justify-between mt-1">
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
            <p className="text-xs text-gray-500 ml-auto">
              {formData.description.length}/2000
            </p>
          </div>
        </div>

        {/* Загрузка изображения */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Изображение
          </label>
          
          {!imagePreview ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className={`w-full border border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400 transition-colors block ${
                  isCompressing ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                <div className="space-y-2">
                  <div className="text-4xl">📷</div>
                  <div className="text-sm text-gray-600">
                    {isCompressing ? 'Обработка изображения...' : 'Нажмите для выбора изображения'}
                  </div>
                  <div className="text-xs text-gray-500">
                    JPEG, PNG, WebP, GIF до 5MB
                  </div>
                </div>
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative inline-block">
                <Image
                  src={imagePreview}
                  alt="Превью"
                  width={300}
                  height={200}
                  className="max-w-full h-48 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
              <div className="text-xs text-gray-500">
                Размер: {formatFileSize(imageSize)}
              </div>
            </div>
          )}
          
          {errors.image && (
            <p className="mt-1 text-sm text-red-600">{errors.image}</p>
          )}
        </div>

        {/* Категория */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Категория *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {EVENT_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>

        {/* Дата и время */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Дата *
            </label>
            <input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
              Время
            </label>
            <input
              id="time"
              name="time"
              type="time"
              value={formData.time}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 ${
                errors.time ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.time && (
              <p className="mt-1 text-sm text-red-600">{errors.time}</p>
            )}
          </div>
        </div>

        {/* Повторяющееся событие */}
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="isRecurring"
              name="isRecurring"
              type="checkbox"
              checked={formData.isRecurring}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700">
              Повторяющееся событие
            </label>
          </div>

          {formData.isRecurring && (
            <div className="ml-6 space-y-4 p-4 bg-gray-50 rounded-md">
              <div>
                <label htmlFor="recurringType" className="block text-sm font-medium text-gray-700 mb-2">
                  Тип повторения
                </label>
                <select
                  id="recurringType"
                  name="recurringType"
                  value={formData.recurringType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                >
                  <option value="weekly">Еженедельно</option>
                  <option value="monthly">Ежемесячно</option>
                </select>
              </div>

              <div>
                <label htmlFor="recurringEndDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Дата окончания повторений *
                </label>
                <input
                  id="recurringEndDate"
                  name="recurringEndDate"
                  type="date"
                  value={formData.recurringEndDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 ${
                    errors.recurringEndDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.recurringEndDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.recurringEndDate}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Кнопка создания */}
        <div className="pt-4 sm:pt-6">
          <button
            type="submit"
            disabled={isLoading || isCompressing}
            className={`w-full bg-indigo-600 text-white py-2 px-6 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors ${
              isLoading || isCompressing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Создание...' : 'Создать мероприятие'}
          </button>
        </div>
      </form>
    </div>
  );
} 