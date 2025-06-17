import { PrismaClient } from "../generated/prisma";
import express, { Request, Response } from "express";
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";
import { expressMiddleware, ExpressMiddlewareOptions } from "@apollo/server/express4";
import { ApolloServer, BaseContext } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { schema } from "./api";

const prisma = new PrismaClient();

type Context = {
    asd: string;
} & BaseContext

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
  
    const asd: Required<Pick<ExpressMiddlewareOptions<Context>, "context">> = {
        context: async ({ req, res }) => ({
            asd: "asd"
        })
    };

    app.use(
        '/graphql',
        cors<cors.CorsRequest>(),
        cookieParser(),
        express.json(),
        // @ts-ignore
        expressMiddleware(server, asd)
    )

    await new Promise<void>(resolve => httpServer.listen({ port: 4000 }, resolve));
    console.log(`🚀  Server ready at: http://localhost:4000/graphql`);
}

main().then( 
    async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });