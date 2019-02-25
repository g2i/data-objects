import React from "react";
import { Provider as ReactProvider } from "@data-objects/react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import { getIntrospectionQuery } from "graphql";

const withIntrospectionQuery = graphql(gql(getIntrospectionQuery()));
const Container = ({ children, data, graphql }) => (
  <ReactProvider schema={data} graphql={graphql}>
    {children}
  </ReactProvider>
);

export default withIntrospectionQuery(Container);
