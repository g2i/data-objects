import gql from "graphql-tag";
import { getIntrospectionQuery } from "graphql";
import introspectionQueryResult from "./introspectionQueryResult.json";

export const mockQuery = jest.fn(({ query }) => {
  const userString = `{user{name}}`;
  const userQuery = gql(userString);
  const introspectionQuery = gql(getIntrospectionQuery());
  switch (query) {
    case userQuery:
      return Promise.resolve({ data: { user: { name: "user" } } });

    case introspectionQuery:
      return Promise.resolve({ data: { schema: introspectionQueryResult } });

    default:
      return Promise.resolve();
  }
});
export const mockMutate = jest.fn(({ mutation }) =>
  Promise.resolve({ data: { post: { upvotes: 2 } } })
);
const mockWatchQuery = jest.fn();
export const ApolloClient = jest.fn().mockImplementation(() => {
  return {
    query: mockQuery,
    mutate: mockMutate
  };
});

export default jest.fn().mockImplementation(() => {
  return {
    watchQuery: mockWatchQuery
  };
});
