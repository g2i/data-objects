import { commaSeparate } from "../../utils/array";
import { mapKeys } from "../../utils/object";

const extractVariables = (mutationVariables = {}) =>
  mapKeys(mutationVariables, v => `$${v}: ${mutationVariables[v].type}`);

const constructVariablesString = (variables = []) => commaSeparate(variables);

const extractArgs = (mutationVariables = {}) =>
  mapKeys(mutationVariables, v => `${v}: $${v}`);

const constructArgsString = (args = []) => commaSeparate(args);

const constructReturnFieldsString = (returnFields = {}) =>
  Object.keys(returnFields).join(" ");

const constructMutationString = (
  mutationName = "",
  variablesString = "",
  argsString = "",
  returnFieldsString = ""
) =>
  `mutation ${mutationName}(${variablesString}){${mutationName}(${argsString}){${returnFieldsString}}}`;

const convertDOModelToMutation = (
  mutationName = "",
  params = {},
  mutationModel = {}
) => {
  const mutationVariables = mutationModel[mutationName]._params;
  const variables = extractVariables(mutationVariables);
  const args = extractArgs(mutationVariables);
  const { _params, ...returnFields } = mutationModel[mutationName];
  const variablesString = constructVariablesString(variables);
  const argsString = constructArgsString(args);
  const returnFieldsString = constructReturnFieldsString(returnFields);
  const mutationString = constructMutationString(
    mutationName,
    variablesString,
    argsString,
    returnFieldsString
  );
  return {
    mutation: mutationString,
    params
  };
};

export default convertDOModelToMutation;
