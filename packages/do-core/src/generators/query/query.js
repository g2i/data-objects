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

/**
 * 
 * difference between JSON.strigify and stringifyQueryVariable
 * 
 * const o = { a: b }
 * 
 * JSON.stringify(o) // => { "a": "b" }
 * stringifyQueryVariable(o) // => { a: "b" }
 * 
 * 
 * const b = { a: b, c: { d: e } }
 * 
 * JSON.stringify(b) // => { "a": "b", "c": { "d": "e" } }"
 * stringifyQueryVariable(b) // => { a: "b", c: { d: "e"}  }"
 * 
 * @param {Object} object 
 */
const stringifyQueryVariable = object => {
  if (typeof object === 'object')
    return `{${Object.keys(object).map(key => `${key}:${stringifyQueryVariable(object[key])}`).join(',')}}`
  return JSON.stringify(object)
}

const convertDalModelToQuery = doModel =>
  Object.keys(doModel).reduce((query, key, i, sourceArray) => {
    if (isVariable(key)) {
      const variables = doModel[key];
      const variablesStrings = mapKeys(
        variables,
        key => `${key}:${stringifyQueryVariable(variables[key])}`
      );
      return `(${commaSeparate(variablesStrings)}){`;
    }
    switch (type(doModel[key])) {
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
        query += key + convertDalModelToQuery(doModel[key][0]);
        break;

      default:
        query += key + convertDalModelToQuery(doModel[key]);
    }
    return (query += isLastIndex(i, sourceArray) ? "}" : " ");
  }, "{");

export default convertDalModelToQuery;
