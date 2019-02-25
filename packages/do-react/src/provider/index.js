import React from "react";
import Context from "context";
import DAL from "@data-objects/core";

export default ({ children, schema, graphql }) => (
  <Context.Provider value={{ dal: new DAL(schema), graphql }}>
    {children}
  </Context.Provider>
);
