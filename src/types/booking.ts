import { ObjectId } from "mongodb";

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface Booking {
  _id?: ObjectId;
  listingId: string;
  userId: string;
  userName: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  status: BookingStatus;
  createdAt: Date;
}

export interface CreateBookingInput {
  listingId: string;
  checkIn: string;
  checkOut: string;
}
