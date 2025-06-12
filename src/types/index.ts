import { Request } from "express";

export interface IUser {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  address: string;
  role: string;
  tenantId?: string | null;
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
    role: string;
    jti: string;
    tenantId: string;
  };
}

export type AuthCookie = {
  accessToken: string;
  refreshToken: string;
};

export interface IRefreshtoken {
  jti: string;
}

export interface ITenant {
  id?: string;
  name: string;
  address: string;
}

export interface UserQueryParams {
  page: number;
  limit: number;
  q: string;
  role: string;
}

export interface TenantQueryParams {
  page: number;
  limit: number;
  q: string;
}
