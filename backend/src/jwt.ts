import jwt from "jsonwebtoken";
import express from "express";

export const ACCESS_TOKEN_EXPIRATION_TIME = "10s";
export const REFRESH_TOKEN_EXPIRATION_TIME = "1h";

export type JWTToken = {
    userId: string;
}

const isJWTToken = (token: any): token is JWTToken => {
    return typeof token === "object" && token !== null && "userId" in token;
}

export const signAccessToken = (payload: JWTToken, res: express.Response): string => {
    if ( !process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET ) {
        throw new Error("Failed to sign JWT header");
    }


    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION_TIME });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRATION_TIME });
    
    let cookieString = `jid=${refreshToken}; HttpOnly; Path=/; Domain=localhost`;
    res.setHeader("Set-Cookie", cookieString);
    return `Bearer ${token}`;
}

export const verifyAccessToken = (token: string): JWTToken | null => {
    if ( !process.env.JWT_SECRET ) {
        throw new Error("Failed to verify JWT token");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if ( !isJWTToken(decoded) ) {
        return null;
    }

    return decoded;
}

export const verifyRefreshToken = (token: string): JWTToken | null => {
    if ( !process.env.REFRESH_TOKEN_SECRET ) {
        throw new Error("Failed to verify refresh token");
    }

    console.log('=== VERIFY REFRESH TOKEN DEBUG ===');
    console.log('Token:', token);
    console.log('==========================');

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    if ( isJWTToken(decoded) ) {
        return decoded;
    }
    return null;
}
