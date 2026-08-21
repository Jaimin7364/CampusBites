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
};

export type CreateOrderInput = {
  items: { menuItemId: string; quantity: number }[]; orderType: OrderType; deliveryType: DeliveryType;
  deliveryAddress?: string; scheduledAt?: string;
};
