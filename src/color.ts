import type { SkinData } from './types/types';

export const TEAM_HUES: Record<number, number> = {
	2: 4, // Red
	3: 207, // Blue
	4: 122, // Green
	5: 54, // Yellow
};

export interface HSL {
	h: number; // 0-360
	s: number; // 0-100
	l: number; // 0-100
}

export function rgbToHsl(color: number): HSL {
	let r = ((color >> 16) & 0xff) / 255;
	let g = ((color >> 8) & 0xff) / 255;
	let b = (color & 0xff) / 255;

	const min = Math.min(r, g, b);
	const max = Math.max(r, g, b);
	const delta = max - min;

	let h = 0;
	let s = 0;
	let l = 0;

	if (delta === 0) {
		h = 0;
	} else if (max === r) {
		h = ((g - b) / delta) % 6;
	} else if (max === g) {
		h = (b - r) / delta + 2;
	} else {
		h = (r - g) / delta + 4;
	}

	h = Math.round(h * 60);
	if (h < 0) h += 360;

	l = (max + min) / 2;
	s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

	s = +(s * 100).toFixed(1);
	l = +(l * 100).toFixed(1);

	return { h, s, l };
}

export function hslToRgb(h: number, s: number, l: number): number {
	s /= 100;
	l /= 100;

	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = l - c / 2;

	let r = 0,
		g = 0,
		b = 0;

	if (h >= 0 && h < 60) {
		r = c;
		g = x;
		b = 0;
	} else if (h >= 60 && h < 120) {
		r = x;
		g = c;
		b = 0;
	} else if (h >= 120 && h < 180) {
		r = 0;
		g = c;
		b = x;
	} else if (h >= 180 && h < 240) {
		r = 0;
		g = x;
		b = c;
	} else if (h >= 240 && h < 300) {
		r = x;
		g = 0;
		b = c;
	} else if (h >= 300 && h < 360) {
		r = c;
		g = 0;
		b = x;
	}

	const ri = Math.round((r + m) * 255);
	const gi = Math.round((g + m) * 255);
	const bi = Math.round((b + m) * 255);

	return ri * 65536 + gi * 256 + bi;
}

export function hueify(color: number, hue: number): number {
	const hsl = rgbToHsl(color);
	hsl.h = hue;
	return hslToRgb(hsl.h, hsl.s, hsl.l);
}

export function teamify(color: number, team: number): number {
	const hue = TEAM_HUES[team];
	if (hue === undefined) return color;
	return hueify(color, hue);
}

export function getDeathColors(skin: SkinData, team?: number): number[] {
	const colors: number[] = [];
	const t = team ?? 1;

	colors.push(teamify(skin.bc, t));
	colors.push(teamify(skin.bc, t));

	for (const layer of skin.layers) {
		colors.push(teamify(layer.color, t));
	}

	return colors;
}
