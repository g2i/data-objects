import React from 'react';
import useDO from '.';
import renderer from 'react-test-renderer';

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
});
