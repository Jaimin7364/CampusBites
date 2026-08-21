import type { User } from '@prisma/client';

export function toPublicUser(user: User) {
  return {
    id: user.id,
    role: user.role.toLowerCase(),
    fullName: user.fullName,
    sellerName: user.sellerName,
    businessOwnerName: user.businessOwnerName,
    email: user.email,
    phone: user.phone,
    profilePhotoUrl: user.profilePhotoUrl,
    active: user.active,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
