import { isLastIndex, commaSeparate } from "../../utils/array";
import { mapKeys } from "../../utils/object";
const isVariable = str => str === "_variables";
const STRING = "string";
const NUMBER = "number";
const BOOL = "boolean";
const ARRAY = "array";
const OBJECT = "object";

const type = object => {
  if (typeof object === STRING) {
    return STRING;
  } else if (typeof object === NUMBER) {
    return NUMBER;
  } else if (typeof object === BOOL) {
    return BOOL;
  } else if (Array.isArray(object)) {
    return ARRAY;
  } else {
    return OBJECT;
  }
};

const convertDalModelToQuery = dalModel =>
  Object.keys(dalModel).reduce((query, key, i, sourceArray) => {
    if (isVariable(key)) {
      const variables = dalModel[key];
      const variablesStrings = mapKeys(
        variables,
        key => `${key}:${JSON.stringify(variables[key])}`
      );
      return `(${commaSeparate(variablesStrings)}){`;
    }
    switch (type(dalModel[key])) {
      case STRING:
        query += key;
        break;

      case NUMBER:
        query += key;
        break;

      case BOOL:
        query += key;
        break;

      case ARRAY:
        query += key + convertDalModelToQuery(dalModel[key][0]);
        break;

      default:
        query += key + convertDalModelToQuery(dalModel[key]);
    }
    return (query += isLastIndex(i, sourceArray) ? "}" : " ");
  }, "{");

export default convertDalModelToQuery;
