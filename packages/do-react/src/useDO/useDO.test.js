import React from 'react';
import useDO from '.';
import renderer from 'react-test-renderer';

describe('useDO', () => {
	it('returns an object with values', () => {
		const TestComponent = () => {    
      const test = useDO({ $do: { name: 'Hi!' } });
      return <p>{test.$do.name}</p>;
    };
    const container = renderer.create(<TestComponent />);
		const tree = container.toJSON();
    expect(tree.children[0]).toBe('Hi!');
	});
});
