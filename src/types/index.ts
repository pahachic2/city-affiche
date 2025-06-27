// Типы для проекта "Афиша мероприятий"

export interface User {
  _id: string;
  email: string;
  name: string;
  password: string;
  avatar?: string;
  createdAt: Date;
}

export interface City {
  _id: string;
  name: string;
  slug: string;
  imageUrl: string;
  eventsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  image?: string;
  imageType?: string;
  city: string;
  category: string;
  date: Date;
  time?: string;
  isOnline: boolean;
  isRecurring: boolean;
  recurringType?: 'weekly' | 'monthly';
  recurringEndDate?: Date;
  authorId: string;
  author?: User;
  votes: Vote[];
  messages: Message[];
  upvotes: number;
  downvotes: number;
  rating: number;
  commentsCount: number;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  _id: string;
  eventId: string;
  userId: string;
  username: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vote {
  _id: string;
  userId: string;
  eventId: string;
  value: number; // +1 или -1
  createdAt: Date;
}

export interface Venue {
  _id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  imageTypes: string[];
  address?: string;
  city: string;
  category: string;
  authorId: string;
  author?: User;
  messages: Message[];
  upvotes: number;
  downvotes: number;
  rating: number;
  commentsCount: number;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Вспомогательные типы
export interface EventFilter {
  city?: string;
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  image?: string;
  imageType?: string;
  city: string;
  category: string;
  date: Date;
  time?: string;
  isOnline: boolean;
  isRecurring?: boolean;
  recurringType?: 'weekly' | 'monthly';
  recurringEndDate?: Date;
}

export interface CreateMessageData {
  content: string;
}

// Категории мероприятий (Частное - первое и дефолтное)
export const EVENT_CATEGORIES = [
  'Частное',
  'Музыка',
  'Театр',
  'Кино',
  'Выставки',
  'Спорт',
  'Образование',
  'Бизнес',
  'Развлечения',
  'Культура',
  'Еда и напитки',
  'Семейные',
  'Здоровье',
  'Технологии',
  'Природа',
  'Другое'
] as const;

export type EventCategory = typeof EVENT_CATEGORIES[number];

// Российские города (основные)
export const CITIES = [
  'Москва',
  'Санкт-Петербург',
  'Новосибирск',
  'Екатеринбург',
  'Нижний Новгород',
  'Казань',
  'Челябинск',
  'Омск',
  'Самара',
  'Ростов-на-Дону',
  'Уфа',
  'Красноярск',
  'Воронеж',
  'Пермь',
  'Волгоград'
] as const;

export type CityName = typeof CITIES[number];

// Категории заведений
export const VENUE_CATEGORIES = [
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
] as const;

export type VenueCategory = typeof VENUE_CATEGORIES[number];

export interface CreateVenueData {
  name: string;
  description: string;
  images?: string[];
  imageTypes?: string[];
  address?: string;
  city: string;
  category: VenueCategory;
} 