import React from "react";
import { ReactProvider } from "@g2i/data-objects-react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { getIntrospectionQuery } from "graphql";
import { ApolloProvider } from "react-apollo";
import ReactProviderContainer from "../reactProviderContainer";

export default ({ children, graphqlURL, config = { link: {}, cache: {} } }) => {
  const client = new ApolloClient({
    // By default, this client will send queries to the
    //  `/graphql` endpoint on the same host
    // Pass the configuration option { uri: YOUR_GRAPHQL_API_URL } to the `HttpLink` to connect
    // to a different host
    link: new HttpLink({ uri: graphqlURL, ...config.link }),
    cache: new InMemoryCache({ ...config.cache })
  });

  const graphqlFunc = input => {
    if (typeof input === "string") {
      return client.query({ query: gql(input) }).then(({ data }) => data);
    } else {
      return client
        .mutate({ mutation: gql(input.mutation), variables: input.params })
        .then(({ data }) => data);
    }
  };

  return (
    <ApolloProvider client={client}>
      <ReactProviderContainer graphql={graphqlFunc}>
        {children}
      </ReactProviderContainer>
    </ApolloProvider>
  );
};
