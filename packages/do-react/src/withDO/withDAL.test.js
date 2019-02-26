import React from "react";
import withDO from ".";
import renderer from "react-test-renderer";
import ReactProvider from "../react-provider";
import schema from "./schema.json";

describe("withDO", () => {
  it("returns the wrapped component", () => {
    const Hello = () => <h1>Hi!</h1>;
    const Container = withDO(Hello);
    const graphql = jest.fn();
    const container = renderer.create(<Container />);
    const tree = container.toJSON();
    expect(tree.children[0]).toBe("Hi!");
  });
  it("passes the container props down", () => {
    const Hello = ({ name }) => <h1>{name}</h1>;
    const Container = withDO(Hello);
    const container = renderer.create(<Container name="Chris" />);
    const tree = container.toJSON();
    expect(tree.children[0]).toBe("Chris");
  });
  it("passes query generated from $do to graphql on context", () => {
    const Hello = ({ $do }) => <h1>{$do.me.name}</h1>;
    Hello.defaultProps = {
      $do: {
        me: {
          name: "placeholder..."
        }
      }
    };
    const query = `{me{name}}`;
    const Container = withDO(Hello);
    const graphql = jest.fn(() => Promise.resolve());
    const container = renderer.create(
      <ReactProvider schema={{}} graphql={graphql}>
        <Container />
      </ReactProvider>
    );
    expect(graphql).toHaveBeenCalledWith(query);
  });
  it("passes the data returned from graphql context to wrapped component", () => {
    const Hello = ({ $do }) => <h1>{$do.me.name}</h1>;
    Hello.defaultProps = {
      $do: {
        me: {
          name: "placeholder..."
        }
      }
    };
    const query = `{me{name}}`;
    const Container = withDO(Hello);
    const graphql = jest.fn(query =>
      Promise.resolve({
        me: {
          name: "Chris Severns"
        }
      })
    );
    const container = renderer.create(
      <ReactProvider schema={{}} graphql={graphql}>
        <Container />
      </ReactProvider>
    );
    return Promise.resolve(container).then(() => {
      const tree = container.toJSON();
      expect(tree.children[0]).toBe("Chris Severns");
    });
  });
  it("sends a warning to the console if $do is not defined in the defaultProps", () => {
    console.warn = jest.fn();
    const Hello = () => <h1>Hi!</h1>;
    const Container = withDO(Hello);
    const container = renderer.create(<Container />);
    expect(console.warn).toHaveBeenCalledWith(
      "$do is not defined in defaultProps for Hello"
    );
  });
  it("passes a loading param on $do", () => {
    const Hello = ({ $do }) => (
      <h1>
        {$do.loading ? "Loading..." : ""}
        {$do.me.name}
      </h1>
    );
    Hello.defaultProps = {
      $do: {
        me: {
          name: "placeholder..."
        }
      }
    };
    const Container = withDO(Hello);
    const graphql = jest.fn(query =>
      Promise.resolve({
        me: {
          name: "Chris Severns"
        }
      })
    );
    const container = renderer.create(
      <ReactProvider schema={{}} graphql={graphql}>
        <Container />
      </ReactProvider>
    );
    const tree = container.toJSON();
    expect(tree.children.find(c => c === "Loading...")).toBe("Loading...");
  });
  it("passes a mutation generated from $do to graphql on context when $do.mutate is called", () => {
    class Hello extends React.Component {
      componentDidUpdate() {
        this.props.$do.mutate("upvotePost", { postId: "1" });
      }

      render() {
        return <h1>{this.props.$do.me.name}</h1>;
      }
    }
    Hello.defaultProps = {
      $do: {
        me: {
          name: "placeholder..."
        },
        mutate: () => {}
      }
    };
    const Container = withDO(Hello);
    const graphql = jest.fn(input => {
      if (typeof input === "string") {
        return Promise.resolve({
          me: {
            name: "Chris"
          }
        });
      } else {
        return Promise.resolve({
          upvotePost: {
            id: "1"
          }
        });
      }
    });
    const container = renderer.create(
      <ReactProvider schema={schema} graphql={graphql}>
        <Container />
      </ReactProvider>
    );
    const mutation = {
      mutation:
        "mutation upvotePost($postId: Int!){upvotePost(postId: $postId){id}}",
      params: {
        postId: "1"
      }
    };
    expect(graphql).toHaveBeenLastCalledWith(mutation);
  });
  describe("when graphql on context throws an error on query", () => {
    it("should pass errors to $do", () => {
      const Hello = ({ $do }) => <h1>{$do.errors.length}</h1>;
      Hello.defaultProps = {
        $do: {
          otherUser: {
            name: "placeholder..."
          },
          errors: []
        }
      };
      const Container = withDO(Hello);
      const graphql = jest.fn(() => Promise.reject({ status: 400 }));
      const container = renderer.create(
        <ReactProvider schema={{}} graphql={graphql}>
          <Container />
        </ReactProvider>
      );
      return Promise.resolve(container)
        .then(() => {})
        .then(() => {
          const tree = container.toJSON();
          expect(tree.children[0]).toBe("1");
        });
    });
  });
  describe("when mutating data", () => {
    it("should merge the returnFields from the mutation into the data provided by $do", () => {
      class Hello extends React.Component {
        constructor(props) {
          super(props);
          this.state = {
            called: false
          };
        }

        componentDidUpdate(prevProps) {
          if (this.state.called) return;
          this.props.$do.mutate("upvotePost", { postId: "1" });
          this.setState({ called: true });
        }

        render() {
          return <h1>{this.props.$do.post.votes}</h1>;
        }
      }
      Hello.defaultProps = {
        $do: {
          post: {
            _variables: { filter: { id: "1" } },
            votes: 0
          }
        }
      };
      const Container = withDO(Hello);
      const graphql = jest.fn(input => {
        if (typeof input === "string") {
          return Promise.resolve({
            post: {
              votes: 1
            }
          });
        } else {
          return Promise.resolve({
            post: {
              votes: 2
            }
          });
        }
      });
      const container = renderer.create(
        <ReactProvider schema={schema} graphql={graphql}>
          <Container />
        </ReactProvider>
      );
      return Promise.resolve(container)
        .then(() => {})
        .then(() => {
          const tree = container.toJSON();
          expect(tree.children[0]).toBe("2");
        });
    });
  });
  describe("when graphql on context throws an error on mutation", () => {
    it("should pass errors to $do", () => {
      class Hello extends React.Component {
        constructor(props) {
          super(props);
          this.state = {
            called: false
          };
        }

        componentDidUpdate(prevProps) {
          if (this.state.called) return;
          this.props.$do.mutate("upvotePost", { postId: "1" });
          this.setState({ called: true });
        }

        render() {
          return <h1>{this.props.$do.errors.length}</h1>;
        }
      }
      Hello.defaultProps = {
        $do: {
          me: {
            name: "placeholder..."
          },
          errors: []
        }
      };
      const Container = withDO(Hello);
      const graphql = jest.fn(input => {
        if (typeof input === "string") {
          return Promise.resolve({
            me: {
              name: "Chris"
            }
          });
        } else {
          return Promise.reject({
            status: 400
          });
        }
      });
      const container = renderer.create(
        <ReactProvider schema={schema} graphql={graphql}>
          <Container />
        </ReactProvider>
      );
      return Promise.resolve(container)
        .then(() => {})
        .then(() => {
          const tree = container.toJSON();
          expect(tree.children[0]).toBe("1");
        });
    });
  });
  describe("when variables prop is set", () => {
    it("overwrites the variables prop on $do", () => {
      const Hello = ({ $do }) => <h1>{$do.users[0].name}</h1>;
      Hello.defaultProps = {
        $do: {
          users: [{ _variables: { id: "1" }, name: "placeholder..." }]
        }
      };
      const Container = withDO(Hello);
      const graphql = jest.fn(() => Promise.resolve());
      const container = renderer.create(
        <ReactProvider schema={{}} graphql={graphql}>
          <Container variables={{ users: { id: "2" } }} />
        </ReactProvider>
      );
      expect(graphql).toHaveBeenCalledWith('{users(id:"2"){name}}');
    });
    it("refetches the query when the variables prop changes", () => {
      const Hello = ({ $do, onClick }) => (
        <h1 onClick={() => onClick("3")}>{$do.users[0].name}</h1>
      );
      Hello.defaultProps = {
        $do: {
          users: [{ _variables: { id: "1" }, name: "placeholder..." }]
        }
      };
      const Container = withDO(Hello);
      const graphql = jest.fn(() => Promise.resolve({}));
      class Stateful extends React.Component {
        constructor(props) {
          super(props);
          this.state = {
            id: "2"
          };
          this.handleClick = this.handleClick.bind(this);
        }

        handleClick(id) {
          this.setState({ id });
        }

        render() {
          return (
            <Container
              onClick={this.handleClick}
              variables={{ users: { id: this.state.id } }}
            />
          );
        }
      }
      const container = renderer.create(
        <ReactProvider schema={{}} graphql={graphql}>
          <Stateful />
        </ReactProvider>
      );
      return Promise.resolve(container).then(() => {
        const h = container.root.find(el => el.type === Stateful);
        h.instance.handleClick("3");
        expect(graphql).toHaveBeenLastCalledWith('{users(id:"3"){name}}');
      });
    });
  });
  describe("delaying the query execution", () => {
    describe("when $do skip property is true", () => {
      it("should not execute the query", () => {
        const Hello = ({ $do }) => <h1>{$do.me.name}</h1>;
        Hello.defaultProps = {
          $do: {
            skip: true,
            me: {
              name: "placeholder..."
            }
          }
        };
        const Container = withDO(Hello);
        const graphql = jest.fn();
        const container = renderer.create(
          <ReactProvider schema={{}} graphql={graphql}>
            <Container />
          </ReactProvider>
        );
        expect(graphql).not.toHaveBeenCalled();
      });
      it("provides a function on the executeQuery prop on $do", () => {
        const Hello = ({ $do }) => <h1>{typeof $do.executeQuery}</h1>;
        Hello.defaultProps = {
          $do: {
            skip: true,
            me: {
              name: "placeholder..."
            },
            executeQuery: null
          }
        };
        const Container = withDO(Hello);
        const graphql = jest.fn();
        const container = renderer.create(
          <ReactProvider schema={{}} graphql={graphql}>
            <Container />
          </ReactProvider>
        );
        const tree = container.toJSON();
        expect(tree.children[0]).toBe("function");
      });
      describe("executeQuery", () => {
        it("calls the graphql function from context", () => {
          const Hello = ({ $do }) => <h1>{$do.executeQuery()}</h1>;
          Hello.defaultProps = {
            $do: {
              skip: true,
              me: {
                name: "placeholder..."
              },
              executeQuery: () => {}
            }
          };
          const Container = withDO(Hello);
          const graphql = jest.fn(() => Promise.resolve({}));
          const container = renderer.create(
            <ReactProvider schema={{}} graphql={graphql}>
              <Container />
            </ReactProvider>
          );
          expect(graphql).toHaveBeenCalled();
        });
        it("passes a properly parsed query based off of $do to graphql on context", () => {
          const Hello = ({ $do }) => <h1>{$do.executeQuery()}</h1>;
          Hello.defaultProps = {
            $do: {
              skip: true,
              me: {
                name: "placeholder..."
              },
              executeQuery: () => {}
            }
          };
          const Container = withDO(Hello);
          const graphql = jest.fn(() => Promise.resolve({}));
          const container = renderer.create(
            <ReactProvider schema={{}} graphql={graphql}>
              <Container />
            </ReactProvider>
          );
          expect(graphql).toHaveBeenCalledWith("{me{name}}");
        });
        it("uses its argument to overwrite variables for the query", () => {
          const Hello = ({ $do }) => (
            <h1>{$do.executeQuery({ users: { id: "2" } })}</h1>
          );
          Hello.defaultProps = {
            $do: {
              skip: true,
              users: {
                _variables: { id: "1" },
                name: "placeholder..."
              },
              executeQuery: () => {}
            }
          };
          const Container = withDO(Hello);
          const graphql = jest.fn(() => Promise.resolve({}));
          const container = renderer.create(
            <ReactProvider schema={{}} graphql={graphql}>
              <Container />
            </ReactProvider>
          );
          expect(graphql).toHaveBeenCalledWith('{users(id:"2"){name}}');
        });
      });
    });
  });
});
