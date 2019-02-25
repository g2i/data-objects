import React from "react";
import { MockedProvider } from "react-apollo/test-utils";
import { getIntrospectionQuery } from "graphql";
import introspectionQueryResult from "./introspectionQueryResult.json";
import gql from "graphql-tag";
const mocks = [
  {
    request: {
      query: gql(getIntrospectionQuery())
    },
    result: {
      data: introspectionQueryResult
    }
  },
  {
    request: {
      query: gql`
        {
          user {
            name
          }
        }
      `
    },
    result: {
      data: {
        user: {
          name: "user"
        }
      }
    }
  }
];

const Mock = ({ children }) => (
  <MockedProvider mocks={mocks}>{children}</MockedProvider>
);

export const ApolloProvider = Mock;
export const graphql = jest.fn(ast =>
  jest.fn(Component =>
    jest.fn(props => {
      graphql(ast);
      return <Component data={introspectionQueryResult} {...props} />;
    })
  )
);
