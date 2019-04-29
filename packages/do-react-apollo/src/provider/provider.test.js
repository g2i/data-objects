import React from "react";
import ReactApolloProvider from ".";
import renderer from "react-test-renderer";
import { ApolloProvider, graphql } from "react-apollo";
import { ApolloClient, mockQuery, mockMutate } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { getIntrospectionQuery } from "graphql";
import gql from "graphql-tag";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ReactProvider, withDO } from "@g2i/data-objects-react";
jest.unmock("do-react");

describe("Provider", () => {
  beforeEach(() => {
    ApolloClient.mockClear();
    HttpLink.mockClear();
    mockQuery.mockClear();
    mockMutate.mockClear();
    graphql.mockClear();
    global.fetch = jest.fn();
  });

  it("returns a do-react provider", () => {
    const provider = renderer.create(<ReactApolloProvider />);
    expect(!!provider.root.find(el => el.type === ReactProvider)).toBe(true);
  });
  it("returns a ApolloProvider", () => {
    const apolloProvider = renderer.create(<ReactApolloProvider />);
    expect(!!apolloProvider.root.find(el => el.type === ApolloProvider)).toBe(
      true
    );
  });
  it("renders children", () => {
    const provider = renderer.create(
      <ReactApolloProvider>
        <div>Hello!</div>
      </ReactApolloProvider>
    );
    const tree = provider.toJSON();
    expect(tree.children[0]).toBe("Hello!");
  });
  it("calls the introspectionQuery on mount", () => {
    const provider = renderer.create(
      <ReactApolloProvider>
        <div>Hello!</div>
      </ReactApolloProvider>
    );
    expect(graphql).toHaveBeenCalledWith(gql(getIntrospectionQuery()));
  });
  describe("when optional config object is passed", () => {
    it("passes the link config object into ApolloClient via HttpLink", () => {
      const provider = renderer.create(
        <ReactApolloProvider
          graphqlURL="https://test.com/graphql"
          config={{ link: { credentials: "include" } }}
        >
          <div>Hello!</div>
        </ReactApolloProvider>
      );
      expect(HttpLink).toHaveBeenCalledWith({
        uri: "https://test.com/graphql",
        credentials: "include"
      });
      expect(ApolloClient.mock.calls[0][0].link.credentials).toBe("include");
    });
    it("passes the cache config to ApolloClient via InMemoryCache", () => {
      const provider = renderer.create(
        <ReactApolloProvider
          graphqlURL="https://test.com/graphql"
          config={{
            link: { credentials: "include" },
            cache: { addTypename: false }
          }}
        >
          <div>Hello!</div>
        </ReactApolloProvider>
      );
      expect(InMemoryCache).toHaveBeenCalledWith({ addTypename: false });
      expect(ApolloClient.mock.calls[0][0].cache.addTypename).toBe(false);
    });
  });
  describe("queries withDO", () => {
    it("returns the data back to the component", () => {
      const Component = ({ $do }) => <h1>{$do.user.name}</h1>;
      Component.defaultProps = {
        $do: {
          user: {
            name: "placeholder"
          }
        }
      };
      const Container = withDO(Component);
      const state = renderer.create(
        <ReactApolloProvider graphqlURL="https://test.com/graphql">
          <Container />
        </ReactApolloProvider>
      );
      return Promise.resolve(state)
        .then(() => { })
        .then(() => {
          const tree = state.toJSON();
          expect(tree.children[0]).toBe("user");
        });
    });
  });
  describe("mutations withDO", () => {
    it("passes a properly formatted AST to graphql", () => {
      const Component = ({ $do }) => (
        <h1 onClick={() => $do.mutate("upvotePost", { postId: "1" })}>
          {$do.user.name}
        </h1>
      );
      Component.defaultProps = {
        $do: {
          user: {
            name: "placeholder..."
          },
          mutate: () => { }
        }
      };
      const Container = withDO(Component);
      const state = renderer.create(
        <ReactApolloProvider graphqlURL="https://test.com/graphql">
          <Container />
        </ReactApolloProvider>
      );
      state.root.find(el => el.type === "h1").props.onClick();
      expect(mockMutate.mock.calls[0][0].mutation).toBe(
        gql(
          `mutation upvotePost($postId: Int!){upvotePost(postId: $postId){id}}`
        )
      );
    });
    it.only("passes arguments to graphql", () => {
      const Component = ({ $do }) => (
        <h1 onClick={() => $do.mutate("upvotePost", { postId: "1" })}>
          {$do.user.name}
        </h1>
      );
      Component.defaultProps = {
        $do: {
          user: {
            name: "placeholder..."
          },
          mutate: () => { }
        }
      };
      const Container = withDO(Component);
      const state = renderer.create(
        <ReactApolloProvider graphqlURL="https://test.com/graphql">
          <Container />
        </ReactApolloProvider>
      );
      state.root.find(el => el.type === "h1").props.onClick();
      expect(mockMutate.mock.calls[0][0].variables).toEqual({ postId: "1" });
    });
    it("passes returned data back through", () => {
      const Component = ({ $do }) => (
        <h1 onClick={() => $do.mutate("upvotePost", { postId: "1" })}>
          {$do.post.upvotes}
        </h1>
      );
      Component.defaultProps = {
        $do: {
          post: {
            upvotes: 1
          },
          mutate: () => { }
        }
      };
      const Container = withDO(Component);
      const state = renderer.create(
        <ReactApolloProvider graphqlURL="https://test.com/graphql">
          <Container />
        </ReactApolloProvider>
      );
      state.root.find(el => el.type === "h1").props.onClick();
      return Promise.resolve(state)
        .then(() => { })
        .then(() => {
          const tree = state.toJSON();
          expect(tree.children[0]).toBe("2");
        });
    });
  });
});
