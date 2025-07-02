import jwt from "jsonwebtoken";
import express from "express";
import zod from "zod";
import { ApplicationAccessLevel } from "../generated/prisma";

export const ACCESS_TOKEN_EXPIRATION_TIME = "10m";
export const REFRESH_TOKEN_EXPIRATION_TIME = "1h";

const JWTTokenSchema = zod.object({
    userId: zod.string(),
    applicationAccessLevel: zod.nativeEnum(ApplicationAccessLevel),
})

export type JWTToken = zod.infer<typeof JWTTokenSchema>;

const isJWTToken = (token: any): token is JWTToken => {
    return JWTTokenSchema.safeParse(token).success;
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
    
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    if ( !isJWTToken(decoded) ) {
        return null;
    }

    return decoded; 
}
