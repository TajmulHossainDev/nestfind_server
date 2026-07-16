import { ObjectId } from "mongodb";

export type ListingCategory =
  | "apartment"
  | "house"
  | "room"
  | "studio"
  | "villa";

export interface Listing {
  _id?: ObjectId;
  title: string;
  shortDescription: string;
  fullDescription: string;
  images: string[];
  price: number;
  location: string;
  category: ListingCategory;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  rating: number;
  reviewCount: number;
  hostId: string;
  hostName: string;
  createdAt: Date;
}

export interface CreateListingInput {
  title: string;
  shortDescription: string;
  fullDescription: string;
  images?: string[];
  price: number;
  location: string;
  category: ListingCategory;
  bedrooms: number;
  bathrooms: number;
  amenities?: string[];
}
