import mongoose, { Schema, Document } from 'mongoose';
import { Venue } from '@/types';

export interface IVenue extends Omit<Venue, '_id' | 'author' | 'messages' | 'authorId'>, Document {
  authorId: mongoose.Types.ObjectId;
  messages: mongoose.Types.ObjectId[];
  upvotes: number;
  downvotes: number;
  rating: number;
  commentsCount: number;
  viewsCount: number;
}

const VenueSchema = new Schema<IVenue>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  images: [{
    type: String,
    // Увеличиваем лимит для Base64 изображений (примерно 7MB в Base64)
    maxlength: 10000000,
  }],
  imageTypes: [{
    type: String,
    enum: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  }],
  address: {
    type: String,
    default: null,
    trim: true,
    maxlength: 300,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
    enum: [
      'Рестораны',
      'Кафе', 
      'Бары', 
      'Клубы', 
      'Музеи', 
      'Театры', 
      'Магазины', 
      'Спорт', 
      'Развлечения', 
      'Красота', 
      'Другое'
    ],
  },
  authorId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  messages: [{
    type: Schema.Types.ObjectId,
    ref: 'Message',
  }],
  // Поля для рейтинга
  upvotes: {
    type: Number,
    default: 0,
  },
  downvotes: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
  commentsCount: {
    type: Number,
    default: 0,
  },
  viewsCount: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

// Индексы для оптимизации запросов
VenueSchema.index({ city: 1, slug: 1 }, { unique: true }); // Уникальность slug в рамках города
VenueSchema.index({ city: 1, category: 1 });
VenueSchema.index({ city: 1, rating: -1 }); // Для сортировки по рейтингу
VenueSchema.index({ authorId: 1 });
VenueSchema.index({ rating: -1 }); // Для общей сортировки по рейтингу

// Виртуальное поле для общего рейтинга
VenueSchema.virtual('totalRating').get(function() {
  return this.upvotes - this.downvotes;
});

// Middleware для автоматического пересчета рейтинга
VenueSchema.pre('save', function() {
  this.rating = this.upvotes - this.downvotes;
  
  // Валидация изображений
  if (this.images && this.images.length > 10) {
    throw new Error('Максимум 10 изображений разрешено');
  }
  
  if (this.images && this.imageTypes && this.images.length !== this.imageTypes.length) {
    throw new Error('Количество изображений должно соответствовать количеству типов');
  }
});

export default mongoose.models.Venue || mongoose.model<IVenue>('Venue', VenueSchema); 