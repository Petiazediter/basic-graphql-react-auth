import { BaseContext } from "@apollo/server";
import { PrismaClient } from "../generated/prisma"
import { verifyAccessToken } from "./jwt";
import { ExpressMiddlewareOptions } from "@as-integrations/express5";
import express from "express";

export interface Context extends BaseContext {
    primsaClient: PrismaClient;
    userId?: string;
    req: express.Request;
    res: express.Response;
}

const prismaClientInstance = new PrismaClient();

export const options: ExpressMiddlewareOptions<Context> = {
    context: async ({ req, res }) => {
        const token = req.headers.authorization?.replace("Bearer ", "");
        let userId: string | undefined;
        try {
            userId = token ? verifyAccessToken(token)?.userId : undefined;
        } catch (error) {
            console.error('token verification failed', error);
        }

        return {
            primsaClient: prismaClientInstance,
            userId,
            req,
            res,
        }
    }
}