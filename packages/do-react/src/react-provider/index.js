import React from "react";
import Context from "../react-context";
import DO from "@g2i/data-objects";

export default ({ children, schema, graphql, doOptions }) => (
  <Context.Provider value={{ $do: new DO(schema, doOptions), graphql }}>
    {children}
  </Context.Provider>
);
