export interface UserAttributes {
  id: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  password: string | null;
  enabled: boolean | null;
  isAdmin: boolean | null;
  profilePicture: string | null;
  lastLogin: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
