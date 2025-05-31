import { Document, ObjectId } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

export interface IProperty extends Document {
  id: string;
  title: string;
  type: string;
  price: number;
  state: string;
  city: string;
  areaSqFt: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string;
  furnished: string;
  availableFrom: Date;
  listedBy: string;
  tags: string;
  colorTheme: string;
  rating: number;
  isVerified: boolean;
  listingType: string;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFavorite extends Document {
  user: ObjectId;
  property: ObjectId;
  createdAt: Date;
}

export interface IRecommendation extends Document {
  sender: ObjectId;
  recipient: ObjectId;
  property: ObjectId;
  message?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface FilterOptions {
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  state?: string;
  city?: string;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  amenities?: string[];
  furnished?: string;
  availableFrom?: Date;
  listedBy?: string;
  tags?: string[];
  minRating?: number;
  isVerified?: boolean;
  listingType?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
}