import GraphQLService from "./graphql";
import schema from "./introspectionResult.json";

describe("GraphQLService", () => {
	describe("construction", () => {
		it("should set schema property equal to provided schema", () => {
			const graphQLService = new GraphQLService(schema);
			expect(graphQLService.schema).toEqual(schema);
		});
	});
	describe("getters", () => {
		describe("schemaTypes", () => {
			it("should return an array of schema types", () => {
				const graphQLService = new GraphQLService(schema);
				const expectedValue = schema.__schema.types;
				expect(graphQLService.schemaTypes).toEqual(expectedValue);
			});
		});
		describe("mutationFields", () => {
			it("should return an array of mutation fields", () => {
				const graphQLService = new GraphQLService(schema);
				const expectedValue = schema.__schema.types.find(
					type => type.name === "Mutation"
				).fields;
				expect(graphQLService.mutationFields).toEqual(expectedValue);
			});
		});
	});
	describe("setters", () => {
		describe("setting schema", () => {
			it("should update the schema", () => {
				const graphQLService = new GraphQLService(schema);
				expect(graphQLService.schema).toEqual(schema);
				graphQLService.schema = {};
				expect(graphQLService.schema).toEqual({});
			});
		});
	});
	describe("methods", () => {
		describe("getMutationModel", () => {
			it("returns params for the mutation", () => {
				const mutationName = "upvotePost";
				const params = {
					postId: {
						type: "Int!",
						inputFields: null
					}
				};
				const graphQLService = new GraphQLService(schema);
				const mutationModel = graphQLService.getMutationModel(mutationName);
				expect(mutationModel[mutationName]._params).toEqual(params);
			});
			it("returns the returnFields for the mutation", () => {
				const mutationName = "upvotePost";
				const graphQLService = new GraphQLService(schema);
				const returnFields = {
					id: "",
					title: "",
					author: ""
				};
				const mutationModel = graphQLService.getMutationModel(
					mutationName,
					returnFields
				);
				const { _params, ...rest } = mutationModel[mutationName];
				expect(rest).toEqual(returnFields);
			});
			it("returns id return field if no returnFields are specified", () => {
				const mutationName = "upvotePost";
				const graphQLService = new GraphQLService(schema);
				const returnFields = {
					id: ""
				};
				const mutationModel = graphQLService.getMutationModel(mutationName);
				const { _params, ...rest } = mutationModel[mutationName];
				expect(rest).toEqual(returnFields);
			});
		});
	});
});
