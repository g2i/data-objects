import React from "react";
import ReactProvider from ".";
import Context from "context";
import renderer from "react-test-renderer";

describe("Provider", () => {
  it("renders children", () => {
    const provider = renderer.create(
      <ReactProvider>
        <h1>Hello!</h1>
      </ReactProvider>
    );
    const tree = provider.toJSON();
    expect(tree.children.length).toBe(1);
  });
  it("provides dal on context", () => {
    const dalModel = {
      user: {
        _variables: { filter: { id: "1" } },
        username: "user"
      }
    };
    const provider = renderer.create(
      <ReactProvider schema={{ schema: "Schema" }}>
        <Context.Consumer>
          {({ dal }) => dal.generateQuery(dalModel)}
        </Context.Consumer>
      </ReactProvider>
    );
    const tree = provider.toJSON();
    expect(tree).toEqual('{user(filter:{"id":"1"}){username}}');
  });
  it("provides graphql function on context", () => {
    const graphql = jest.fn();
    const provider = renderer.create(
      <ReactProvider schema={{}} graphql={graphql}>
        <Context.Consumer>{({ dal, graphql }) => graphql()}</Context.Consumer>
      </ReactProvider>
    );
    expect(graphql).toHaveBeenCalled();
  });
});
