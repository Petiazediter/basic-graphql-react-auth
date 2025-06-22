import jwt from "jsonwebtoken";

export type JWTToken = {
    userId: string;
}

const isJWTToken = (token: any): token is JWTToken => {
    return typeof token === "object" && token !== null && "userId" in token;
}

export const signJWTHeader = (payload: JWTToken): string => {
    if ( !process.env.JWT_SECRET ) {
        throw new Error("Failed to sign JWT header");
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "10m" });
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
