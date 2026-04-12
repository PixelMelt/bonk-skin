import { describe, it, expect } from 'bun:test';
import { rgbToHsl, hslToRgb, hueify, teamify, getDeathColors, TEAM_HUES } from '../src/color';
import type { SkinData } from '../src/types/types';

describe('rgbToHsl', () => {
	it('converts pure red', () => {
		const hsl = rgbToHsl(0xff0000);
		expect(hsl.h).toBe(0);
		expect(hsl.s).toBe(100);
		expect(hsl.l).toBe(50);
	});

	it('converts pure green', () => {
		const hsl = rgbToHsl(0x00ff00);
		expect(hsl.h).toBe(120);
		expect(hsl.s).toBe(100);
		expect(hsl.l).toBe(50);
	});

	it('converts pure blue', () => {
		const hsl = rgbToHsl(0x0000ff);
		expect(hsl.h).toBe(240);
		expect(hsl.s).toBe(100);
		expect(hsl.l).toBe(50);
	});

	it('converts white', () => {
		const hsl = rgbToHsl(0xffffff);
		expect(hsl.h).toBe(0);
		expect(hsl.s).toBe(0);
		expect(hsl.l).toBe(100);
	});

	it('converts black', () => {
		const hsl = rgbToHsl(0x000000);
		expect(hsl.h).toBe(0);
		expect(hsl.s).toBe(0);
		expect(hsl.l).toBe(0);
	});

	it('converts mid-gray', () => {
		const hsl = rgbToHsl(0x808080);
		expect(hsl.h).toBe(0);
		expect(hsl.s).toBe(0);
		expect(hsl.l).toBeCloseTo(50.2, 0);
	});
});

describe('hslToRgb', () => {
	it('converts pure red', () => {
		expect(hslToRgb(0, 100, 50)).toBe(0xff0000);
	});

	it('converts pure green', () => {
		expect(hslToRgb(120, 100, 50)).toBe(0x00ff00);
	});

	it('converts pure blue', () => {
		expect(hslToRgb(240, 100, 50)).toBe(0x0000ff);
	});

	it('converts white', () => {
		expect(hslToRgb(0, 0, 100)).toBe(0xffffff);
	});

	it('converts black', () => {
		expect(hslToRgb(0, 0, 0)).toBe(0x000000);
	});
});

describe('rgbToHsl / hslToRgb roundtrip', () => {
	const colors = [
		0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffffff, 0x000000, 0x448aff,
		0xc75050,
	];

	for (const color of colors) {
		it(`roundtrips 0x${color.toString(16).padStart(6, '0')}`, () => {
			const hsl = rgbToHsl(color);
			const back = hslToRgb(hsl.h, hsl.s, hsl.l);
			// Allow +-2 per channel due to toFixed(1) truncation in HSL
			const rDiff = Math.abs(((back >> 16) & 0xff) - ((color >> 16) & 0xff));
			const gDiff = Math.abs(((back >> 8) & 0xff) - ((color >> 8) & 0xff));
			const bDiff = Math.abs((back & 0xff) - (color & 0xff));
			expect(rDiff).toBeLessThanOrEqual(2);
			expect(gDiff).toBeLessThanOrEqual(2);
			expect(bDiff).toBeLessThanOrEqual(2);
		});
	}
});

describe('hueify', () => {
	it('shifts hue to red team (4)', () => {
		const result = hueify(0x00ff00, 4);
		const hsl = rgbToHsl(result);
		expect(hsl.h).toBe(4);
		expect(hsl.s).toBeCloseTo(100, 0);
		expect(hsl.l).toBeCloseTo(50, 0);
	});

	it('shifts hue to blue team (207)', () => {
		const result = hueify(0xff0000, 207);
		const hsl = rgbToHsl(result);
		expect(hsl.h).toBe(207);
	});

	it('preserves achromatic colors (black, white, gray)', () => {
		expect(hueify(0x000000, 4)).toBe(0x000000);
		expect(hueify(0xffffff, 4)).toBe(0xffffff);
	});
});

describe('teamify', () => {
	it('returns color unchanged for team 1 (FFA)', () => {
		expect(teamify(0xff0000, 1)).toBe(0xff0000);
	});

	it('returns color unchanged for unknown team', () => {
		expect(teamify(0xff0000, 0)).toBe(0xff0000);
		expect(teamify(0xff0000, 99)).toBe(0xff0000);
	});

	it('applies red hue for team 2', () => {
		const result = teamify(0x00ff00, 2);
		const hsl = rgbToHsl(result);
		expect(hsl.h).toBe(TEAM_HUES[2]);
	});

	it('applies blue hue for team 3', () => {
		const result = teamify(0xff0000, 3);
		const hsl = rgbToHsl(result);
		expect(hsl.h).toBe(TEAM_HUES[3]);
	});

	it('applies green hue for team 4', () => {
		const result = teamify(0xff0000, 4);
		const hsl = rgbToHsl(result);
		expect(hsl.h).toBe(TEAM_HUES[4]);
	});

	it('applies yellow hue for team 5', () => {
		const result = teamify(0xff0000, 5);
		const hsl = rgbToHsl(result);
		expect(hsl.h).toBe(TEAM_HUES[5]);
	});
});

describe('getDeathColors', () => {
	it('returns body color twice plus layer colors', () => {
		const skin: SkinData = {
			bc: 0xff0000,
			layers: [
				{
					id: 1,
					scale: 1,
					angle: 0,
					x: 0,
					y: 0,
					flipX: false,
					flipY: false,
					color: 0x00ff00,
				},
				{
					id: 2,
					scale: 1,
					angle: 0,
					x: 0,
					y: 0,
					flipX: false,
					flipY: false,
					color: 0x0000ff,
				},
			],
		};
		const colors = getDeathColors(skin);
		expect(colors).toHaveLength(4);
		expect(colors[0]).toBe(0xff0000);
		expect(colors[1]).toBe(0xff0000);
		expect(colors[2]).toBe(0x00ff00);
		expect(colors[3]).toBe(0x0000ff);
	});

	it('applies team hue shift to all colors', () => {
		const skin: SkinData = {
			bc: 0x00ff00,
			layers: [
				{
					id: 1,
					scale: 1,
					angle: 0,
					x: 0,
					y: 0,
					flipX: false,
					flipY: false,
					color: 0x0000ff,
				},
			],
		};
		const colors = getDeathColors(skin, 3);
		for (const c of colors) {
			const hsl = rgbToHsl(c);
			expect(hsl.h).toBe(TEAM_HUES[3]);
		}
	});

	it('returns just body color twice for empty skin', () => {
		const skin: SkinData = { bc: 0xaabbcc, layers: [] };
		const colors = getDeathColors(skin);
		expect(colors).toHaveLength(2);
		expect(colors[0]).toBe(0xaabbcc);
		expect(colors[1]).toBe(0xaabbcc);
	});
});
