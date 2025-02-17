import { Request } from "express";

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  address: string;
  role: string;
}

export interface RegisterRequest extends Request {
  body: IUser;
}

export interface AuthResponse {
  message: string;
  id: number;
  errors: Array<{ msg: string }>;
}

export interface AuthHeaders {
  ["set-cookie"]?: Array<string>;
}

export interface AuthRequest extends Request {
  auth: {
    sub: string;
  };
  role: string;
}
