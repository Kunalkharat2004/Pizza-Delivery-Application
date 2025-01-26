import { Request } from "express";

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  address: string;
}

export interface RegisterRequest extends Request {
  body: IUser;
}

export interface RegisterResponse {
  message: string;
  id: number;
}
