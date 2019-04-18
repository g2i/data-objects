import React from 'react';
import Context from '../react-context';
import merge from 'lodash/merge';

const useDO = defaultProps => {

	if (!defaultProps) {
		console.warn('No default props have been passed to useDO()');
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
		errors: [],
		loading: false,
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
					queryFields[key][0] = {
            _variables: variables[key],
            ...queryFields[key][0],
          }
				} else {
					queryFields[key] = {
            _variables: variables[key],
            ...queryFields[key],
          }
				}
				return queryFields;
			}, {...queryFields});

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
		} = defaultProps;

		const mappedQueryFields = fetchVariables
			? mapVariablesToQueryFields(fetchVariables, queryFields) 
			: queryFields

		const query = context.$do.generateQuery(mappedQueryFields);
		return fetchData(query)
	}

	return { $do: merge({}, defaultProps, returnedData), fetch: doFetch, mutate };

};

export default useDO;
