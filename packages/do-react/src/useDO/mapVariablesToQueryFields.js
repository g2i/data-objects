
export const mapVariablesToQueryFields = (variables, queryFields) => {
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

export default mapVariablesToQueryFields;
