import React from "react";
import Provider from ".";
import Context from "context";
import renderer from "react-test-renderer";

describe("Provider", () => {
	it("renders children", () => {
		const provider = renderer.create(
			<Provider>
				<h1>Hello!</h1>
			</Provider>
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
			<Provider schema={{ schema: "Schema" }}>
				<Context.Consumer>
					{({ dal }) => dal.generateQuery(dalModel)}
				</Context.Consumer>
			</Provider>
		);
		const tree = provider.toJSON();
		expect(tree).toEqual('{user(filter:{"id":"1"}){username}}');
	});
	it("provides graphql function on context", () => {
		const graphql = jest.fn();
		const provider = renderer.create(
			<Provider schema={{}} graphql={graphql}>
				<Context.Consumer>{({ dal, graphql }) => graphql()}</Context.Consumer>
			</Provider>
		);
		expect(graphql).toHaveBeenCalled();
	});
});
