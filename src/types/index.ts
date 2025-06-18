// Типы для проекта "Афиша мероприятий"

export interface User {
  _id: string;
  email: string;
  name: string;
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
  city: string;
  category: string;
  date: Date;
  isOnline: boolean;
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
  senderId: string;
  sender?: User;
  text?: string;
  imageUrl?: string;
  timestamp: Date;
}

export interface Vote {
  _id: string;
  userId: string;
  eventId: string;
  value: number; // +1 или -1
  createdAt: Date;
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
  city: string;
  category: string;
  date: Date;
  isOnline: boolean;
}

export interface CreateMessageData {
  eventId: string;
  text?: string;
  imageUrl?: string;
}

// Категории мероприятий
export const EVENT_CATEGORIES = [
  'Концерты',
  'Театр',
  'Кино',
  'Выставки',
  'Спорт',
  'Образование',
  'Бизнес',
  'Развлечения',
  'Культура',
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