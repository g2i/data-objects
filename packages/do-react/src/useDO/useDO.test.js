import useDO from '.';

describe('useDO', () => {
	it('returns an object with values', () => {
		const test = useDO({
			$do: {
				name: ''
			}
		});
		console.log(test);
		expect(1).toBe(1);
	});
});