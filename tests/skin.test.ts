import { describe, it, expect } from 'bun:test';
import { encodeSkin, decodeSkin, getBlankSkin, getNewLayer } from '../src/index';
import skins from './skins.json';

const testSkins = skins as string[];

describe('skin encode/decode roundtrip', () => {
	it('has test skins to work with', () => {
		expect(testSkins.length).toBeGreaterThan(0);
	});

	for (let i = 0; i < testSkins.length; i++) {
		const skinData = testSkins[i];

		describe(`skin ${i}`, () => {
			it('decodes without throwing', () => {
				expect(() => decodeSkin(skinData)).not.toThrow();
			});

			it('roundtrips decode -> encode -> decode to the same skin data', () => {
				const decoded = decodeSkin(skinData);
				const reEncoded = encodeSkin(decoded);
				const reDecoded = decodeSkin(reEncoded);
				expect(reDecoded).toEqual(decoded);
			});
		});
	}
});

describe('skin encode/decode edge cases', () => {
	it('returns blank skin for empty string', () => {
		const decoded = decodeSkin('');
		expect(decoded.layers).toHaveLength(0);
		expect(decoded.bc).toBe(4492031);
	});

	it('returns blank skin for invalid input', () => {
		const decoded = decodeSkin('not-valid-data!!!');
		expect(decoded.layers).toHaveLength(0);
		expect(decoded.bc).toBe(4492031);
	});

	it('roundtrips a blank skin', () => {
		const skin = getBlankSkin();
		const encoded = encodeSkin(skin);
		const decoded = decodeSkin(encoded);
		expect(decoded.bc).toBe(skin.bc);
		expect(decoded.layers).toHaveLength(0);
	});

	it('roundtrips 16 layers (maximum)', () => {
		const skin = getBlankSkin();
		for (let i = 0; i < 16; i++) {
			const layer = getNewLayer();
			layer.id = (i % 115) + 1;
			skin.layers.push(layer);
		}
		const encoded = encodeSkin(skin);
		const decoded = decodeSkin(encoded);
		expect(decoded.layers).toHaveLength(16);
	});

	it('preserves float precision for scale, angle, x, y', () => {
		const skin = getBlankSkin();
		const layer = getNewLayer();
		layer.scale = 2.5;
		layer.angle = 1.234;
		layer.x = 42.5;
		layer.y = -17.75;
		skin.layers.push(layer);

		const decoded = decodeSkin(encodeSkin(skin));
		expect(decoded.layers[0].scale).toBeCloseTo(2.5, 5);
		expect(decoded.layers[0].angle).toBeCloseTo(1.234, 3);
		expect(decoded.layers[0].x).toBeCloseTo(42.5, 5);
		expect(decoded.layers[0].y).toBeCloseTo(-17.75, 5);
	});
});
