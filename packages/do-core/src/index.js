import GraphQLService from "services/graphql/graphql";
import { generateQuery, generateMutation } from "generators";

export default class DAL {
	constructor(schema) {
		this.graphQLService = new GraphQLService(schema);
	}

	generateQuery(dalModel) {
		return generateQuery(dalModel);
	}

	generateMutation(mutationName, params, returnFields = { id: "" }) {
		const mutationModel = this.graphQLService.getMutationModel(
			mutationName,
			returnFields
		);
		return generateMutation(mutationName, params, mutationModel);
	}
}
