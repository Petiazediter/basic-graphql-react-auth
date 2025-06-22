import { PrismaClient } from "../generated/prisma";
import express from "express";
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";
import { expressMiddleware, ExpressMiddlewareOptions } from "@apollo/server/express4";
import { ApolloServer, BaseContext } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { schema } from "./api";

type Context = {
    prismaClient: PrismaClient;
} & BaseContext

const prismaClientInstance = new PrismaClient();

async function main() {
    const app = express();
    const httpServer = http.createServer(app);

    app.use(cors({
      origin: "http://localhost:3000",
      credentials: true,
    }));

    const server = new ApolloServer<Context>({
        schema,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer: httpServer })]
    });
  
    await server.start();
  
    const middleware: Required<Pick<ExpressMiddlewareOptions<Context>, "context">> = {
        context: async ({ req, res }) => ({
            prismaClient: prismaClientInstance
        })
    };

    app.use(
        '/graphql',
        cors<cors.CorsRequest>(),
        cookieParser(),
        express.json(),
        // @ts-ignore
        expressMiddleware(server, middleware)
    )

    await new Promise<void>(resolve => httpServer.listen({ port: 4000 }, resolve));
    console.log(`🚀  Server ready at: http://localhost:4000/graphql`);
}

main().then( 
    async () => {
        await prismaClientInstance.$connect();
    })
    .catch(async (e) => {
        console.error(e);
        await prismaClientInstance.$disconnect();
        process.exit(1);
    });