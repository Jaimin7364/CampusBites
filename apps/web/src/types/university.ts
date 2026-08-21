export type University = {
  id: string;
  name: string;
  city: string;
  state: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UniversityList = {
  universities: University[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type UniversityInput = {
  name: string;
  city: string;
  state: string | null;
  active?: boolean;
};
