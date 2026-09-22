import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

interface TokenPayload {
  id: string;
  email: string;
  [key: string]: any;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const secret: Secret = process.env.JWT_ACCESS_SECRET || "access_secret_key";
  const options: SignOptions = {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN as any) || "15m",
  };

  return jwt.sign(payload, secret, options);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const secret: Secret = process.env.JWT_REFRESH_SECRET || "refresh_secret_key";
  const options: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN as any) || "7d",
  };

  return jwt.sign(payload, secret, options);
};