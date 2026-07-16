import { ObjectId } from "mongodb";

export interface Wishlist {
  _id?: ObjectId;
  userId: string;
  listingId: string;
  createdAt: Date;
}
