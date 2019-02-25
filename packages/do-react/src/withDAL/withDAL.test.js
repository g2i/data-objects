import React from "react";
import withDAL from ".";
import renderer from "react-test-renderer";
import Provider from "provider";
import schema from "./schema.json";

describe("withDAL", () => {
	it("returns the wrapped component", () => {
		const Hello = () => <h1>Hi!</h1>;
		const Container = withDAL(Hello);
		const graphql = jest.fn();
		const container = renderer.create(<Container />);
		const tree = container.toJSON();
		expect(tree.children[0]).toBe("Hi!");
	});
	it("passes the container props down", () => {
		const Hello = ({ name }) => <h1>{name}</h1>;
		const Container = withDAL(Hello);
		const container = renderer.create(<Container name="Chris" />);
		const tree = container.toJSON();
		expect(tree.children[0]).toBe("Chris");
	});
	it("passes query generated from dal to graphql on context", () => {
		const Hello = ({ dal }) => <h1>{dal.me.name}</h1>;
		Hello.defaultProps = {
			dal: {
				me: {
					name: "placeholder..."
				}
			}
		};
		const query = `{me{name}}`;
		const Container = withDAL(Hello);
		const graphql = jest.fn(() => Promise.resolve());
		const container = renderer.create(
			<Provider schema={{}} graphql={graphql}>
				<Container />
			</Provider>
		);
		expect(graphql).toHaveBeenCalledWith(query);
	});
	it("passes the data returned from graphql context to wrapped component", () => {
		const Hello = ({ dal }) => <h1>{dal.me.name}</h1>;
		Hello.defaultProps = {
			dal: {
				me: {
					name: "placeholder..."
				}
			}
		};
		const query = `{me{name}}`;
		const Container = withDAL(Hello);
		const graphql = jest.fn(query =>
			Promise.resolve({
				me: {
					name: "Chris Severns"
				}
			})
		);
		const container = renderer.create(
			<Provider schema={{}} graphql={graphql}>
				<Container />
			</Provider>
		);
		return Promise.resolve(container).then(() => {
			const tree = container.toJSON();
			expect(tree.children[0]).toBe("Chris Severns");
		});
	});
	it("sends a warning to the console if dal is not defined in the defaultProps", () => {
		console.warn = jest.fn();
		const Hello = () => <h1>Hi!</h1>;
		const Container = withDAL(Hello);
		const container = renderer.create(<Container />);
		expect(console.warn).toHaveBeenCalledWith(
			"dal is not defined in defaultProps for Hello"
		);
	});
	it("passes a loading param on dal", () => {
		const Hello = ({ dal }) => (
			<h1>
				{dal.loading ? "Loading..." : ""}
				{dal.me.name}
			</h1>
		);
		Hello.defaultProps = {
			dal: {
				me: {
					name: "placeholder..."
				}
			}
		};
		const Container = withDAL(Hello);
		const graphql = jest.fn(query =>
			Promise.resolve({
				me: {
					name: "Chris Severns"
				}
			})
		);
		const container = renderer.create(
			<Provider schema={{}} graphql={graphql}>
				<Container />
			</Provider>
		);
		const tree = container.toJSON();
		expect(tree.children.find(c => c === "Loading...")).toBe("Loading...");
	});
	it("passes a mutation generated from dal to graphql on context when dal.mutate is called", () => {
		class Hello extends React.Component {
			componentDidUpdate() {
				this.props.dal.mutate("upvotePost", { postId: "1" });
			}

			render() {
				return <h1>{this.props.dal.me.name}</h1>;
			}
		}
		Hello.defaultProps = {
			dal: {
				me: {
					name: "placeholder..."
				},
				mutate: () => {}
			}
		};
		const Container = withDAL(Hello);
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
			<Provider schema={schema} graphql={graphql}>
				<Container />
			</Provider>
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
		it("should pass errors to dal", () => {
			const Hello = ({ dal }) => <h1>{dal.errors.length}</h1>;
			Hello.defaultProps = {
				dal: {
					otherUser: {
						name: "placeholder..."
					},
					errors: []
				}
			};
			const Container = withDAL(Hello);
			const graphql = jest.fn(() => Promise.reject({ status: 400 }));
			const container = renderer.create(
				<Provider schema={{}} graphql={graphql}>
					<Container />
				</Provider>
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
		it("should merge the returnFields from the mutation into the data provided by dal", () => {
			class Hello extends React.Component {
				constructor(props) {
					super(props);
					this.state = {
						called: false
					};
				}

				componentDidUpdate(prevProps) {
					if (this.state.called) return;
					this.props.dal.mutate("upvotePost", { postId: "1" });
					this.setState({ called: true });
				}

				render() {
					return <h1>{this.props.dal.post.votes}</h1>;
				}
			}
			Hello.defaultProps = {
				dal: {
					post: {
						_variables: { filter: { id: "1" } },
						votes: 0
					}
				}
			};
			const Container = withDAL(Hello);
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
				<Provider schema={schema} graphql={graphql}>
					<Container />
				</Provider>
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
		it("should pass errors to dal", () => {
			class Hello extends React.Component {
				constructor(props) {
					super(props);
					this.state = {
						called: false
					};
				}

				componentDidUpdate(prevProps) {
					if (this.state.called) return;
					this.props.dal.mutate("upvotePost", { postId: "1" });
					this.setState({ called: true });
				}

				render() {
					return <h1>{this.props.dal.errors.length}</h1>;
				}
			}
			Hello.defaultProps = {
				dal: {
					me: {
						name: "placeholder..."
					},
					errors: []
				}
			};
			const Container = withDAL(Hello);
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
				<Provider schema={schema} graphql={graphql}>
					<Container />
				</Provider>
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
		it("overwrites the variables prop on dal", () => {
			const Hello = ({ dal }) => <h1>{dal.users[0].name}</h1>;
			Hello.defaultProps = {
				dal: {
					users: [{ _variables: { id: "1" }, name: "placeholder..." }]
				}
			};
			const Container = withDAL(Hello);
			const graphql = jest.fn(() => Promise.resolve());
			const container = renderer.create(
				<Provider schema={{}} graphql={graphql}>
					<Container variables={{ users: { id: "2" } }} />
				</Provider>
			);
			expect(graphql).toHaveBeenCalledWith('{users(id:"2"){name}}');
		});
		it("refetches the query when the variables prop changes", () => {
			const Hello = ({ dal, onClick }) => (
				<h1 onClick={() => onClick("3")}>{dal.users[0].name}</h1>
			);
			Hello.defaultProps = {
				dal: {
					users: [{ _variables: { id: "1" }, name: "placeholder..." }]
				}
			};
			const Container = withDAL(Hello);
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
				<Provider schema={{}} graphql={graphql}>
					<Stateful />
				</Provider>
			);
			return Promise.resolve(container).then(() => {
				const h = container.root.find(el => el.type === Stateful);
				h.instance.handleClick("3");
				expect(graphql).toHaveBeenLastCalledWith('{users(id:"3"){name}}');
			});
		});
	});
	describe("delaying the query execution", () => {
		describe("when dal skip property is true", () => {
			it("should not execute the query", () => {
				const Hello = ({ dal }) => <h1>{dal.me.name}</h1>;
				Hello.defaultProps = {
					dal: {
						skip: true,
						me: {
							name: "placeholder..."
						}
					}
				};
				const Container = withDAL(Hello);
				const graphql = jest.fn();
				const container = renderer.create(
					<Provider schema={{}} graphql={graphql}>
						<Container />
					</Provider>
				);
				expect(graphql).not.toHaveBeenCalled();
			});
			it("provides a function on the executeQuery prop on dal", () => {
				const Hello = ({ dal }) => <h1>{typeof dal.executeQuery}</h1>;
				Hello.defaultProps = {
					dal: {
						skip: true,
						me: {
							name: "placeholder..."
						},
						executeQuery: null
					}
				};
				const Container = withDAL(Hello);
				const graphql = jest.fn();
				const container = renderer.create(
					<Provider schema={{}} graphql={graphql}>
						<Container />
					</Provider>
				);
				const tree = container.toJSON();
				expect(tree.children[0]).toBe("function");
			});
			describe("executeQuery", () => {
				it("calls the graphql function from context", () => {
					const Hello = ({ dal }) => <h1>{dal.executeQuery()}</h1>;
					Hello.defaultProps = {
						dal: {
							skip: true,
							me: {
								name: "placeholder..."
							},
							executeQuery: () => {}
						}
					};
					const Container = withDAL(Hello);
					const graphql = jest.fn(() => Promise.resolve({}));
					const container = renderer.create(
						<Provider schema={{}} graphql={graphql}>
							<Container />
						</Provider>
					);
					expect(graphql).toHaveBeenCalled();
				});
				it("passes a properly parsed query based off of dal to graphql on context", () => {
					const Hello = ({ dal }) => <h1>{dal.executeQuery()}</h1>;
					Hello.defaultProps = {
						dal: {
							skip: true,
							me: {
								name: "placeholder..."
							},
							executeQuery: () => {}
						}
					};
					const Container = withDAL(Hello);
					const graphql = jest.fn(() => Promise.resolve({}));
					const container = renderer.create(
						<Provider schema={{}} graphql={graphql}>
							<Container />
						</Provider>
					);
					expect(graphql).toHaveBeenCalledWith("{me{name}}");
				});
				it("uses its argument to overwrite variables for the query", () => {
					const Hello = ({ dal }) => (
						<h1>{dal.executeQuery({ users: { id: "2" } })}</h1>
					);
					Hello.defaultProps = {
						dal: {
							skip: true,
							users: {
								_variables: { id: "1" },
								name: "placeholder..."
							},
							executeQuery: () => {}
						}
					};
					const Container = withDAL(Hello);
					const graphql = jest.fn(() => Promise.resolve({}));
					const container = renderer.create(
						<Provider schema={{}} graphql={graphql}>
							<Container />
						</Provider>
					);
					expect(graphql).toHaveBeenCalledWith('{users(id:"2"){name}}');
				});
			});
		});
	});
});
