/*
  do-core contains the recursive functions for parsing a js object
  and building the graphql query as well as using introspection to
  create the mutation calls
*/
import GraphQLService from "./services/graphql/graphql";
import { generateQuery, generateMutation } from "./generators";
export default class DO {
  constructor(schema) {
    this.graphQLService = new GraphQLService(schema);
  }

  generateQuery(doModel) {
    return generateQuery(doModel);
  }

  generateMutation(mutationName, params, returnFields = { id: "" }) {
    const mutationModel = this.graphQLService.getMutationModel(
      mutationName,
      returnFields
    );
    return generateMutation(mutationName, params, mutationModel);
  }
}
