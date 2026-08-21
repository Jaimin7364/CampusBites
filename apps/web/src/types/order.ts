export type OrderType = 'INSTANT' | 'PREORDER';
export type DeliveryType = 'PICKUP' | 'DELIVERY';
export type PaymentMethod = 'CASH';
export type PaymentStatus = 'PENDING' | 'PAID';
export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';

export type OrderItem = {
  id: string; menuItemId: string; itemName: string; pricePaise: number; quantity: number;
  veg: boolean; bestseller: boolean; itemTotalPaise: number;
};

export type Order = {
  id: string; orderNumber: string; userId: string; userName: string; userPhone: string;
  sellerId: string; sellerName: string; hotelId: string; hotelName: string; hotelPhone: string;
  universityId: string; subtotalPaise: number; deliveryChargePaise: number; platformFeePaise: number;
  totalAmountPaise: number; orderType: OrderType; deliveryType: DeliveryType;
  deliveryAddress: string | null; scheduledAt: string | null; paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus; status: OrderStatus; createdAt: string; updatedAt: string; items: OrderItem[];
  acceptedAt?: string | null; preparingAt?: string | null; readyAt?: string | null; completedAt?: string | null;
  rejectedAt?: string | null; cancelledAt?: string | null; paymentPaidAt?: string | null;
  statusHistory?: { id: string; fromStatus: OrderStatus | null; toStatus: OrderStatus; changedById: string; createdAt: string }[];
};

export type SellerOrderFilters = { page?: number; limit?: number; status?: OrderStatus; orderType?: OrderType; deliveryType?: DeliveryType; paymentStatus?: PaymentStatus; search?: string };
export type SellerOrderSummary = { statusCounts: Record<OrderStatus, number>; todayOrders: number; todaySalesPaise: number; todayCompletedOrders: number; businessDate: string };

export type CreateOrderInput = {
  items: { menuItemId: string; quantity: number }[]; orderType: OrderType; deliveryType: DeliveryType;
  deliveryAddress?: string; scheduledAt?: string;
};
