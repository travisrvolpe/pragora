import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { addResolversToSchema } from '@graphql-tools/schema';
import { join } from 'path';

// Load schema files
const schema = loadSchemaSync(join(process.cwd(), 'src/lib/graphql/schema/**/*.graphql'), {
  loaders: [new GraphQLFileLoader()]
});

// Add empty resolvers to make the schema executable
const executableSchema = addResolversToSchema({
  schema,
  resolvers: {
    Query: {},
    Mutation: {},
    Subscription: {}
  }
});

export default executableSchema;