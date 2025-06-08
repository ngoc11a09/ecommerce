import { Role } from '../constants/roles.constant';

export type User = {
  id: string;
  email: string;
  password: string;
  name: string;
  googleId: string;
  roles: Role[];
  picture: string;
};
