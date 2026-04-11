import { describe, it, expect } from 'bun:test';
import {
	validateSkin,
	validateLayers,
	decodeAndValidate,
	encodeSkin,
	getBlankSkin,
	getNewLayer,
} from '../src/index';
import type { SkinLayer } from '../src/index';

describe('validateLayers', () => {
	it('accepts an empty array', () => {
		const r = validateLayers([]);
		expect(r.valid).toBe(true);
		expect(r.issues).toHaveLength(0);
	});

	it('accepts a valid layer', () => {
		expect(validateLayers([getNewLayer()]).valid).toBe(true);
	});

	it('rejects id below 1', () => {
		const l = getNewLayer();
		l.id = 0;
		const r = validateLayers([l]);
		expect(r.valid).toBe(false);
		expect(r.issues.some((i) => i.path.includes('id'))).toBe(true);
	});

	it('rejects id above 115', () => {
		const l = getNewLayer();
		l.id = 116;
		const r = validateLayers([l]);
		expect(r.valid).toBe(false);
		expect(r.issues.some((i) => i.path.includes('id'))).toBe(true);
	});

	it('accepts id at boundaries', () => {
		const l1 = getNewLayer();
		l1.id = 1;
		const l2 = getNewLayer();
		l2.id = 115;
		expect(validateLayers([l1, l2]).valid).toBe(true);
	});

	it('rejects scale out of range', () => {
		const l = getNewLayer();
		l.scale = 11;
		expect(validateLayers([l]).valid).toBe(false);

		const l2 = getNewLayer();
		l2.scale = -11;
		expect(validateLayers([l2]).valid).toBe(false);
	});

	it('accepts scale at boundaries', () => {
		const l1 = getNewLayer();
		l1.scale = -10;
		const l2 = getNewLayer();
		l2.scale = 10;
		expect(validateLayers([l1, l2]).valid).toBe(true);
	});

	it('rejects angle out of range', () => {
		const l = getNewLayer();
		l.angle = 10000;
		expect(validateLayers([l]).valid).toBe(false);
	});

	it('rejects x out of range', () => {
		const l = getNewLayer();
		l.x = 100000;
		expect(validateLayers([l]).valid).toBe(false);
	});

	it('rejects y out of range', () => {
		const l = getNewLayer();
		l.y = -100000;
		expect(validateLayers([l]).valid).toBe(false);
	});

	it('rejects color out of range', () => {
		const l = getNewLayer();
		l.color = 16777216;
		expect(validateLayers([l]).valid).toBe(false);
	});

	it('rejects negative color', () => {
		const l = getNewLayer();
		l.color = -1;
		expect(validateLayers([l]).valid).toBe(false);
	});

	it('rejects non-boolean flipX', () => {
		const l = getNewLayer();
		(l as any).flipX = 1;
		const r = validateLayers([l]);
		expect(r.valid).toBe(false);
		expect(r.issues.some((i) => i.path.includes('flipX'))).toBe(true);
	});

	it('rejects non-boolean flipY', () => {
		const l = getNewLayer();
		(l as any).flipY = 'yes';
		const r = validateLayers([l]);
		expect(r.valid).toBe(false);
		expect(r.issues.some((i) => i.path.includes('flipY'))).toBe(true);
	});

	it('rejects more than 16 layers', () => {
		const layers = Array.from({ length: 17 }, () => getNewLayer());
		const r = validateLayers(layers);
		expect(r.valid).toBe(false);
		expect(r.issues.some((i) => i.message.includes('exceeds maximum of 16'))).toBe(true);
	});

	it('accepts exactly 16 layers', () => {
		const layers = Array.from({ length: 16 }, () => getNewLayer());
		expect(validateLayers(layers).valid).toBe(true);
	});
});

describe('validateSkin', () => {
	it('accepts a blank skin', () => {
		const r = validateSkin(getBlankSkin());
		expect(r.valid).toBe(true);
		expect(r.issues).toHaveLength(0);
	});

	it('accepts a valid skin with layers', () => {
		const skin = getBlankSkin();
		skin.layers.push(getNewLayer());
		expect(validateSkin(skin).valid).toBe(true);
	});

	it('rejects base color out of range', () => {
		const skin = getBlankSkin();
		skin.bc = -1;
		const r = validateSkin(skin);
		expect(r.valid).toBe(false);
		expect(r.issues.some((i) => i.path === 'bc')).toBe(true);
	});

	it('rejects base color above maximum', () => {
		const skin = getBlankSkin();
		skin.bc = 16777216;
		expect(validateSkin(skin).valid).toBe(false);
	});

	it('accepts base color at boundaries', () => {
		const skin = getBlankSkin();
		skin.bc = 0;
		expect(validateSkin(skin).valid).toBe(true);
		skin.bc = 16777215;
		expect(validateSkin(skin).valid).toBe(true);
	});

	it('collects issues from both bc and layers', () => {
		const skin = getBlankSkin();
		skin.bc = -1;
		const l = getNewLayer();
		l.id = 0;
		skin.layers.push(l);
		const r = validateSkin(skin);
		expect(r.valid).toBe(false);
		expect(r.issues.some((i) => i.path === 'bc')).toBe(true);
		expect(r.issues.some((i) => i.path.includes('layers'))).toBe(true);
	});

	it('issue objects include constraint metadata', () => {
		const skin = getBlankSkin();
		skin.bc = -1;
		const r = validateSkin(skin);
		const bcIssue = r.issues.find((i) => i.path === 'bc');
		expect(bcIssue).toBeDefined();
		expect(bcIssue!.constraint?.min).toBe(0);
		expect(bcIssue!.constraint?.max).toBe(16777215);
	});
});

describe('decodeAndValidate', () => {
	it('decodes and validates a blank skin roundtrip', () => {
		const encoded = encodeSkin(getBlankSkin());
		const { skin, validation } = decodeAndValidate(encoded);
		expect(validation.valid).toBe(true);
		expect(skin.layers).toHaveLength(0);
	});

	it('returns both decoded skin and validation result', () => {
		const original = getBlankSkin();
		original.layers.push(getNewLayer());
		const encoded = encodeSkin(original);
		const { skin, validation } = decodeAndValidate(encoded);
		expect(skin.layers).toHaveLength(1);
		expect(validation.valid).toBe(true);
		expect(validation.issues).toHaveLength(0);
	});
});
