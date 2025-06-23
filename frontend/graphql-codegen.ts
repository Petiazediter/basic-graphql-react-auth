import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  overwrite: true,
  schema: 'http://localhost:4000/graphql',
  documents: ['src/**/*.graphql.ts'],
  generates: {
    "src/": {  // ← Generate in src directory
      preset: "near-operation-file",  // ← This is the key
      presetConfig: {
        extension: ".tsx",  // ← Generated file extension
        baseTypesPath: "~@/__generated__/graphql",  // ← Path to base types
        folder: "__generated__"  // ← Subfolder for generated files
      },
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo"
      ],
      config: {
        withHooks: true,
        withComponent: false,
        withHOC: false,
        skipTypename: false,
        dedupeOperationSuffix: true,
        dedupeFragments: true
      }
    },
    "src/__generated__/graphql.ts": {  // ← Base types file
      plugins: ["typescript"],
      config: {
        skipTypename: false,
        dedupeFragments: true
      }
    }
  }
}

export default config;