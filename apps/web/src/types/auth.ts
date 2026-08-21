export type UserRole = 'user' | 'seller' | 'admin';

export type AuthUser = {
  id: string;
  role: UserRole;
  fullName: string | null;
  sellerName: string | null;
  businessOwnerName: string | null;
  email: string;
  phone: string;
  profilePhotoUrl: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = { user: AuthUser; accessToken: string };

export function roleHome(role: UserRole) {
  return `/${role}`;
}
