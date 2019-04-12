import React from 'react';
import Context from '../react-context';
import merge from 'lodash/merge';

const useDO = (defaultProps) => {
  const [returnedData, setReturnedData] = React.useState({ errors: [] });
  const context = React.useContext(Context);

  const fetchData = async (fetch, query) => {
    try { 
      const data = await fetch(query);
      setReturnedData({ ...returnedData, ...data, loading: false });
    } catch (error) {
      setReturnedData({
        ...returnedData,
        errors: [...returnedData.errors, error],
        loading: false
      });
    }
  }

  React.useEffect(() => {
    mutate();
    const { mutate, loading, errors, skip, executeQuery, ...queryFields } = defaultProps.$do;

    if (defaultProps.variables) {
      Object.keys(defaultProps.variables).reduce((queryFields, key) => {
        if (Array.isArray(queryFields[key])) {
          queryFields[key][0]._variables = variables[key];
        } else {
          queryFields[key]._variables = variables[key];
        }
        return queryFields;
      }, queryFields);
    }

    const query = context.$do.generateQuery(queryFields);
    
    if (defaultProps.$do.skip) {
      setReturnedData({
        ...returnedData,
        executeQuery: variables => {
          if (variables) {
            Object.keys(variables).reduce((queryFields, key) => {
              if (Array.isArray(queryFields[key])) {
                queryFields[key][0]._variables = variables[key];
              } else {
                queryFields[key]._variables = variables[key];
              }
              return queryFields;
            }, queryFields);
            const newQuery = context.$do.generateQuery(
              queryFields
            );
            fetchData(context.graphql, newQuery);
          } else {
            fetchData(context.graphql, query);
          }
        }
      });
    } else {
      setReturnedData({
        ...returnedData,
        mutate,
        loading: true
      });
      fetchData(context.graphql, query);
    }
  }, [defaultProps.$do, defaultProps.variables]);

  const mutate = async (mutationName, params, returnFields = { id: "" }) => {
    const mutation = context.$do.generateMutation(
      mutationName,
      params,
      returnFields
    );
    try {
      const data = await context.graphql(mutation);
      setReturnedData({ ...returnedData, ...data });
    } catch (error) {
      setReturnedData({
        ...returnedData,
        errors: [...returnedData.errors],
        error
      });
    }
  };

  if (defaultProps && defaultProps.$do) {
    return { $do: merge(defaultProps.$do, returnedData), mutate };
  } else {
    console.warn('$do is not defined in defaultProps for this component.');
  }
}

export default useDO;
