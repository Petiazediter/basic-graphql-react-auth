import { BaseContext, ContextFunction } from "@apollo/server";
import { PrismaClient } from "../generated/prisma"
import { verifyJWTToken } from "./jwt";
import { ExpressMiddlewareOptions } from "@as-integrations/express5";
import e from "express";

export interface Context extends BaseContext {
    primsaClient: PrismaClient;
    userId?: string;
    req: e.Request;
    res: e.Response;
}

const prismaClientInstance = new PrismaClient();

export const options: ExpressMiddlewareOptions<Context> = {
    context: async ({ req, res }) => {
        const token = req.headers.authorization?.replace("Bearer ", "");
        const userId = token ? verifyJWTToken(token)?.userId : undefined;
    
        return {
            primsaClient: prismaClientInstance,
            userId,
            req,
            res,
        }
    }
}