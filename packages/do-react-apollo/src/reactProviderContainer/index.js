import React from "react";
import { Provider } from "@g2i/data-objects-react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import { getIntrospectionQuery } from "graphql";

const withIntrospectionQuery = graphql(gql(getIntrospectionQuery()));
const Container = ({ children, data, graphql }) => (
  <Provider schema={data} graphql={graphql}>
    {children}
  </Provider>
);

export default withIntrospectionQuery(Container);
