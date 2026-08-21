import type { University } from './university';

export type HotelStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type Hotel = {
  id: string;
  sellerId: string;
  universityId: string;
  hotelName: string;
  address: string;
  phone: string;
  whatsappNumber: string;
  description: string;
  hotelImageUrl: string;
  menuImageUrl: string | null;
  openTime: string;
  closeTime: string;
  featured: boolean;
  active: boolean;
  status: HotelStatus;
  rejectReason: string | null;
  approvedById: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  university: Pick<University, 'id' | 'name' | 'city' | 'state' | 'active'>;
  seller: { id: string; sellerName: string | null; businessOwnerName: string | null; email: string; phone: string };
  approvedBy: { id: string; fullName: string | null; email: string } | null;
};

export type HotelInput = {
  universityId: string;
  hotelName: string;
  address: string;
  phone: string;
  whatsappNumber: string;
  description: string;
  hotelImageUrl: string;
  menuImageUrl: string | null;
  openTime: string;
  closeTime: string;
};

export type HotelList = {
  hotels: Hotel[];
  pagination: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean };
};
