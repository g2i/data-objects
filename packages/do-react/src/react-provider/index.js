import React from "react";
import Context from "../react-context";
import DO from "@g2i/data-objects";

export default ({ children, schema, graphql }) => (
  <Context.Provider value={{ $do: new DO(schema), graphql }}>
    {children}
  </Context.Provider>
);
