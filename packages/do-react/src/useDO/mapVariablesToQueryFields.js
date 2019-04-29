
export const mapVariablesToQueryFields = (variables, queryFields) => {
  const res = Object.keys(variables)
    .reduce((queryFields, key) => {
      if (Array.isArray(queryFields[key])) {
        const {
          _variables,
          ...qf // extract old _variables
        } = queryFields[key][0]
        queryFields[key][0] = {
          _variables: variables[key],
          ...qf,
        }


      } else {
        const {
          _variables,
          ...qf // extract old _variables
        } = queryFields[key]

        queryFields[key] = {
          _variables: variables[key],
          ...qf,
        }
      }
      return queryFields;
    }, {...queryFields});
  return res
}

export default mapVariablesToQueryFields;
