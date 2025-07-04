import _ from "lodash"
import fs from "fs";
import path, { dirname } from "path";
import { pathToFileURL, fileURLToPath } from "url";
import { makeExecutableSchema } from "@graphql-tools/schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const files = fs.readdirSync(__dirname)
    .filter((file) => file.endsWith(".graphql.ts"))

const modules = await Promise.all(
    files.map(async (file) => {
        const modulePath = pathToFileURL(path.join(__dirname, file)).href;
        const module = await import(modulePath);
        return module;
    })
);

const typeDefsModules = modules.map((module) => module.typeDef);
const resolversModules = _.merge(
    modules.map((module) => module.resolvers)
)

const typeDefs = [`
    schema {
        query: Query
        mutation: Mutation
    }

    type Mutation {
        ok: Boolean
    }

    type Query {
        ok: Boolean
    }

`, ...typeDefsModules]

const schema = makeExecutableSchema({ 
    typeDefs,
    resolvers: resolversModules,
});

export { schema };