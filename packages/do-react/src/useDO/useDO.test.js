import React from 'react';
import useDO from '.';
import renderer from 'react-test-renderer';
import ReactProvider from '../react-provider';
import schema from './schema.json';

describe('useDO', () => {
	it('returns text actual value', () => {
		const TestComponent = () => {
			const { $do } = useDO({ $do: { name: 'Hi!' } });
			return <p>{$do.name}</p>;
		};
		const container = renderer.create(<TestComponent />);
		const tree = container.toJSON();
		expect(tree.children[0]).toBe('Hi!');
	});
	it('passes the container props', () => {
		const defaultProps = {
			$do: {
				me: {
					name: 'placeholder...'
				}
			}
		};
		const Hello = () => {
			const { $do, fetch } = useDO(defaultProps);
			React.useEffect(() => {
				fetch()
			}, [])
			return <div>{$do.me.name}</div>;
		};
		const query = `{me{name}}`;
		const graphql = jest.fn(() => Promise.resolve());
		renderer.create(
			<ReactProvider schema={{}} {...{ graphql }}>
				<Hello />
			</ReactProvider>
		);
		expect(graphql).toHaveBeenCalledWith(query);
	});
});
