import type { HotelStatus } from './hotel';
import type { Order, OrderStatus, PaymentStatus } from './order';

export type Pagination = { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean };
export type AdminAccount = {
  id: string; role: 'USER' | 'SELLER'; fullName: string | null; sellerName: string | null;
  businessOwnerName: string | null; email: string; phone: string; profilePhotoUrl: string | null;
  active: boolean; createdAt: string; updatedAt: string; _count?: { orders?: number; sellerOrders?: number };
  ownedHotels?: { id: string; hotelName: string; status: HotelStatus; active: boolean; university: { id: string; name: string; city: string } }[];
};
export type AdminOrderSummary = Pick<Order, 'id' | 'orderNumber' | 'userId' | 'userName' | 'sellerId' | 'sellerName' | 'hotelId' | 'hotelName' | 'universityId' | 'totalAmountPaise' | 'orderType' | 'deliveryType' | 'paymentMethod' | 'paymentStatus' | 'status' | 'scheduledAt' | 'createdAt' | 'updatedAt'>;
export type AdminOrder = Order & {
  user: AdminAccount; seller: AdminAccount;
  hotel: { id: string; hotelName: string; phone: string; address: string; status: HotelStatus; active: boolean; university: { id: string; name: string; city: string; state: string | null; active: boolean } };
};
export type AdminDashboard = {
  universities: number; users: number; sellers: number; hotels: number; pendingHotels: number;
  approvedHotels: number; featuredHotels: number; orders: number; pendingOrders: number;
  completedOrders: number; totalOrderValuePaise: number; totalOrderValueDefinition: string;
};
export type AdminAccountFilters = { page?: number; limit?: number; search?: string; active?: '' | 'true' | 'false' };
export type AdminOrderFilters = { page?: number; limit?: number; search?: string; universityId?: string; hotelId?: string; status?: '' | OrderStatus; paymentStatus?: '' | PaymentStatus; dateFrom?: string; dateTo?: string };
