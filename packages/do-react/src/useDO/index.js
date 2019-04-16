import React from 'react';
import Context from '../react-context';
import merge from 'lodash/merge';

const useDO = defaultProps => {

	if (!defaultProps || !defaultProps.$do) {
		console.warn('$do is not defined in defaultProps for this component.');
		return {}
	}

	const context = React.useContext(Context);
	const fetchGql = context.graphql;
	
	const mutate = (mutationName, params, returnFields = { id: '' }) => {
			const mutation = context.$do.generateMutation(
				mutationName,
				params,
				returnFields
			);
			return fetchGql(mutation)
				.then(data => {
					setReturnedData({ ...returnedData, ...data })
				})
				.catch(error => {
					setReturnedData({
						...returnedData,
						errors: [...returnedData.errors, error],
					});
				})
		};

	const [returnedData, setReturnedData] = React.useState({
		mutate,
		errors: []
	});

	const fetchData = (query) => {
		setReturnedData({ ...returnedData, loading: true })
		return fetchGql(query)
			.then(data => {
				setReturnedData({ ...returnedData, ...data, loading: false });
			})
			.catch(res => {
				setReturnedData({
					...returnedData,
					errors: [...returnedData.errors, res],
					loading: false
				});
			})
	};

	const mapVariablesToQueryFields = (variables, queryFields) => {

		const res = Object.keys(variables)
			.reduce((queryFields, key) => {
				if (Array.isArray(queryFields[key])) {
					queryFields[key][0]._variables = variables[key];
				} else {
					queryFields[key]._variables = variables[key];
				}
				return queryFields;
			}, queryFields);

		return res
	}


	const doFetch = (fetchVariables) => {
		const {
			mutate: defaultMutate, // remove it from rest
			loading,
			errors,
			skip,
			executeQuery,
			variables, // remove it
			...queryFields
		} = defaultProps.$do;

		if (fetchVariables) {
			mapVariablesToQueryFields(fetchVariables, queryFields)
		}
		const query = context.$do.generateQuery(queryFields);

		if (defaultProps.$do.skip) {
			setReturnedData({
				...returnedData,
				executeQuery: variables => {
					if (variables) {
						mapVariablesToQueryFields(variables, queryFields)
						const newQuery = context.$do.generateQuery(queryFields);
						fetchData(newQuery);
					} else {
						fetchData(query);
					}
				}
			});
		} else {
			setReturnedData({
				...returnedData,
				mutate,
				loading: true
			});
			fetchData(query);
		}
	}

	return { $do: merge({}, defaultProps.$do, returnedData), fetch: doFetch };

};

export default useDO;
