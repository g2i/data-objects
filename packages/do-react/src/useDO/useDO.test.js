import React from 'react';
import useDO from '.';
import renderer, { act } from 'react-test-renderer';
import ReactProvider from '../react-provider';
import schema from './schema.json';

// for hooks in sync jest rendering
beforeAll(() => jest.spyOn(React, 'useEffect').mockImplementation(React.useLayoutEffect))
afterAll(() => React.useEffect.mockRestore())

describe('useDO', () => {
  it('returns text actual value', () => {
    const TestComponent = () => {
      const { $do } = useDO( { name: 'Hi!' } );
      return <p>{$do.name}</p>;
    };
    const container = renderer.create(<TestComponent />);
    const tree = container.toJSON();
    expect(tree.children[0]).toBe('Hi!');
  });
  it('passes the container props', () => {
    const defaultProps = {
        me: {
          name: 'placeholder...'
        }
    };
    const Hello = () => {

        const { fetch } = useDO(defaultProps);
        React.useEffect(() => {
          fetch()
        }, [])
      return <div>hello</div>;
    };
    const query = `{me{name}}`;
    const graphql = jest.fn(() => Promise.resolve());
    act(() => {
      renderer.create(
        <ReactProvider schema={{}} {...{ graphql }}>
          <Hello />
        </ReactProvider>
      );
    })
    expect(graphql).toHaveBeenCalledWith(query);
  });
});
