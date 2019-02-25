import React from "react";
import { ReactProvider } from "@g2i/data-objects-react";
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
