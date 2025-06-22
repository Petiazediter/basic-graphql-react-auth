import jwt from "jsonwebtoken";
import express from "express";

export type JWTToken = {
    userId: string;
}

const isJWTToken = (token: any): token is JWTToken => {
    return typeof token === "object" && token !== null && "userId" in token;
}

export const signJWTHeader = (payload: JWTToken, res: express.Response): string => {
    if ( !process.env.JWT_SECRET ) {
        throw new Error("Failed to sign JWT header");
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const sameSite = isProduction ? 'Strict' : 'None';

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "10m" });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.setHeader("Set-Cookie", [
        `jid=${refreshToken}; HttpOnly; Path=/refresh-token; SameSite=${sameSite}; Secure;`
    ]);
    return `Bearer ${token}`;
}

export const verifyJWTToken = (token: string): JWTToken | null => {
    if ( !process.env.JWT_SECRET ) {
        throw new Error("Failed to verify JWT token");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if ( !isJWTToken(decoded) ) {
        return null;
    }

    return decoded;
}

export const verifyRefreshToken = (token: string): boolean => {
    if ( !process.env.JWT_SECRET ) {
        throw new Error("Failed to verify refresh token");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return isJWTToken(decoded);
}
