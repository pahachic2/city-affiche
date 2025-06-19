import mongoose, { Schema, Document } from 'mongoose';
import { Event } from '@/types';

export interface IEvent extends Omit<Event, '_id' | 'author' | 'votes' | 'messages' | 'authorId'>, Document {
  authorId: mongoose.Types.ObjectId;
  votes: mongoose.Types.ObjectId[];
  messages: mongoose.Types.ObjectId[];
  upvotes: number;
  downvotes: number;
  rating: number;
  commentsCount: number;
  viewsCount: number;
}

const EventSchema = new Schema<IEvent>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  image: {
    type: String,
    default: null,
    // Увеличиваем лимит для Base64 изображений (примерно 7MB в Base64)
    maxlength: 10000000,
  },
  imageType: {
    type: String,
    default: null,
    enum: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', null],
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
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    default: null,
    // Формат HH:MM
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringType: {
    type: String,
    enum: ['weekly', 'monthly', null],
    default: null,
  },
  recurringEndDate: {
    type: Date,
    default: null,
  },
  authorId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  votes: [{
    type: Schema.Types.ObjectId,
    ref: 'Vote',
  }],
  messages: [{
    type: Schema.Types.ObjectId,
    ref: 'Message',
  }],
  // Новые поля для рейтинга
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
EventSchema.index({ city: 1, date: 1 });
EventSchema.index({ category: 1, date: 1 });
EventSchema.index({ authorId: 1 });
EventSchema.index({ date: 1 });
EventSchema.index({ rating: -1 }); // Для сортировки по рейтингу
EventSchema.index({ city: 1, rating: -1 }); // Для городской ленты
EventSchema.index({ isRecurring: 1 }); // Для повторяющихся событий
EventSchema.index({ recurringEndDate: 1 }); // Для очистки старых повторяющихся событий

// Виртуальное поле для общего рейтинга
EventSchema.virtual('totalRating').get(function() {
  return this.upvotes - this.downvotes;
});

// Middleware для автоматического пересчета рейтинга
EventSchema.pre('save', function() {
  this.rating = this.upvotes - this.downvotes;
  
  // Валидация повторяющихся событий
  if (this.isRecurring && !this.recurringType) {
    throw new Error('Для повторяющегося события необходимо указать тип повторения');
  }
  
  if (this.isRecurring && this.recurringEndDate && this.recurringEndDate <= this.date) {
    throw new Error('Дата окончания повторений должна быть позже даты события');
  }
});

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema); 