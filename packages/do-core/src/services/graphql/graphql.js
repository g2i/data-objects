export default class GraphQLService {
	constructor(
		schema,
		options = {
			mutationTypeName: 'Mutation'
		}
	) {
		this.schema = schema;
		this.options = options;
	}

	get schemaTypes() {
		return this.schema.__schema.types;
	}

	get mutationFields() {
		const schemaType = this.schemaTypes.find(type => type.name === this.options.mutationTypeName);
		return schemaType ? schemaType.fields : [];
	}

	getMutationModel(mutationName, returnFields = { id: "" }) {
		const mutationFields = this.mutationFields;
		const mutation = mutationFields.find(field => field.name === mutationName);
		const model = {};
		model[mutationName] = {
			_params: mutation.args.reduce((acc, arg) => {
				acc[arg.name] = {
					type: arg.type.ofType.name + "!",
					inputFields: arg.type.ofType.inputFields
						? arg.type.ofType.inputFields.map(field => ({
								name: field.name,
								type: field.type.ofType.name + "!"
						  }))
						: null
				};
				return acc;
			}, {}),
			...returnFields
		};
		return model;
	}
}
