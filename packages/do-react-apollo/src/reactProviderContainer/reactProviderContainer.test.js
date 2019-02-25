import React from "react";
import { ReactProvider } from "@g2i/data-objects-react";
import ReactProviderContainer from ".";
import renderer from "react-test-renderer";
import introspectionQueryResult from "../../__mocks__/introspectionQueryResult.json";
import { getIntrospectionQuery } from "graphql";

describe("introspectionquery", () => {
  it("should match snapshot", () => {
    expect(getIntrospectionQuery()).toMatchSnapshot();
  });
});

describe("ReactProviderContainer", () => {
  beforeEach(() => {
    ReactProvider.mockClear();
  });
  it("should return children", () => {
    const container = renderer.create(
      <ReactProviderContainer>
        <div>Hello!</div>
      </ReactProviderContainer>
    );
    const tree = container.toJSON();
    expect(tree.children[0]).toBe("Hello!");
  });
  it("returns a ReactProvider", () => {
    const container = renderer.create(
      <ReactProviderContainer>
        <div>Hello!</div>
      </ReactProviderContainer>
    );
    const provider = container.root.find(el => el.type === ReactProvider);
    expect(!!provider).toBe(true);
  });
  it("passes data prop to schema prop on ReactProvider", () => {
    const container = renderer.create(
      <ReactProviderContainer>
        <div>Hello!</div>
      </ReactProviderContainer>
    );
    expect(ReactProvider.mock.calls[0][0].schema).toBe(
      introspectionQueryResult
    );
  });
  it("passes graphql to graphql prop on ReactProvider", () => {
    const graphql = jest.fn();
    const container = renderer.create(
      <ReactProviderContainer graphql={graphql}>
        <div>Hello!</div>
      </ReactProviderContainer>
    );
    expect(ReactProvider.mock.calls[0][0].graphql).toBe(graphql);
  });
});
