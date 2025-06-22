import { PrismaClient } from "../generated/prisma";
import express from "express";
import cors from "cors";
import http from "http";
import cookieParser from "cookie-parser";
import { expressMiddleware } from "@as-integrations/express5"
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { schema } from "./api";
import { Context, options } from "./context";
import { refreshTokenPath } from "./api/refreshTokenRoute";

const prismaClientInstance = new PrismaClient();

async function main() {
    const app = express();
    // Health check endpoint
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'healthy' });
    });
    
    const httpServer = http.createServer(app);

    app.use(cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
    }));

    const server = new ApolloServer<Context>({
        schema,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer: httpServer })]
    });
  
    await server.start();

    app.use(
        '/graphql',
        cors<cors.CorsRequest>(),
        cookieParser(),
        express.json(),
        expressMiddleware<Context>(server, {
            context: options.context!,
        })
    )

    app.post('/refresh-token', refreshTokenPath);

    const port = process.env.PORT || 4000;
    await new Promise<void>(resolve => httpServer.listen({ port }, resolve));
    console.log(`🚀  Server ready at: http://localhost:${port}/graphql`);
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