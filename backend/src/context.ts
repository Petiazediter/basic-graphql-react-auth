import { BaseContext, ContextFunction } from "@apollo/server";
import { PrismaClient } from "../generated/prisma"
import { ExpressContextFunctionArgument } from "@apollo/server/dist/esm/express4";

export type Context = {
    primsaClient: PrismaClient;
} & BaseContext;

const prismaClientInstance = new PrismaClient();

export const contextFn: ContextFunction<[ExpressContextFunctionArgument], Context> = async () => {
    return {
        primsaClient: prismaClientInstance
    }
} 