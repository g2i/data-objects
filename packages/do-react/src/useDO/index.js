import React from 'react';
import Context from '../react-context';
import merge from 'lodash/merge';
import mapVariablesToQueryFields from './mapVariablesToQueryFields'

const useDO = defaultProps => {
  if (!defaultProps) {
    console.warn('No default props have been passed to useDO()');
    return {}
  }

  const context = React.useContext(Context);
  const fetchGql = context.graphql;

  const [state, setState] = React.useState({
    errors: [],
    loading: false,
  });
  
  const mutate = (mutationName, params, returnFields = { id: '' }) => {
    /**
     * Set updating state to true
     */
    setState({ ...state, updating: true })

    const mutation = context.$do.generateMutation(
      mutationName,
      params,
      returnFields
    );

    /**
     * Return promise for better UI handling
     */
    return fetchGql(mutation)
      .then(data => {
        setState({
          ...state,
          ...data,
          updating: false
        })
      })
      .catch(error => {
        setState({
          ...state,
          updating: false,
          errors: [...state.errors, error],
        });
      })
    };


  const fetchData = (query) => {
    /**
     * Set loading state to true
     */
    setState({ ...state, loading: true })

    /**
     * Return promise for better UI handling
     */
    return fetchGql(query)
      .then(data => {
        setState({
          ...state,
          ...data,
          loading: false
        });
      })
      .catch(res => {
        setState({
          ...state,
          errors: [...state.errors, res],
          loading: false
        });
      })
  };


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

  return { $do: merge({}, defaultProps, state), fetch: doFetch, mutate };

};

export default useDO;
