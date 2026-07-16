import { ObjectId } from "mongodb";

export interface Review {
  _id?: ObjectId;
  listingId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface CreateReviewInput {
  listingId: string;
  rating: number;
  comment: string;
}
