import mongoose, { Schema, Document } from 'mongoose';

export interface ICity extends Document {
  name: string;
  slug: string;
  imageUrl: string;
  eventsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CitySchema = new Schema<ICity>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  eventsCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Индексы для поиска
CitySchema.index({ name: 'text' });

export default mongoose.models.City || mongoose.model<ICity>('City', CitySchema); 