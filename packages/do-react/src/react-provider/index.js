import React from "react";
import Context from "context";
import DAL from "@g2i/data-objects";

export default ({ children, schema, graphql }) => (
  <Context.Provider value={{ dal: new DAL(schema), graphql }}>
    {children}
  </Context.Provider>
);
