import { BaseContext } from "@apollo/server";
import { PrismaClient } from "../generated/prisma"
import { JWTToken, verifyAccessToken } from "./jwt";
import { ExpressMiddlewareOptions } from "@as-integrations/express5";
import express from "express";
import RBAC from "./rbac/rbac";

export interface Context extends BaseContext {
    primsaClient: PrismaClient;
    userId?: string;
    req: express.Request;
    res: express.Response;
    rbac: RBAC;
}

const prismaClientInstance = new PrismaClient();

export const options: ExpressMiddlewareOptions<Context> = {
    context: async ({ req, res }) => {
        const token = req.headers.authorization?.replace("Bearer ", "");
        let userToken: JWTToken | null = null;
        try {
            userToken = token ? verifyAccessToken(token) : null;
        } catch (error) {
            console.error('token verification failed', error);
        }

        return {
            primsaClient: prismaClientInstance,
            userId: userToken ? userToken.userId : undefined,
            req,
            res,
            rbac: new RBAC(prismaClientInstance, userToken)
        }
    }
}