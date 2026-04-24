export interface ApplicationAttributes {
  id: number;
  name: string;
  apiKey: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
