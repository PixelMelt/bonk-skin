import type { SkinData, SkinLayer } from './types/types';

export const DEFAULT_BASE_COLOR = 4492031;

export const DEFAULT_COLORS = [
	15702682, 16027569, 13538264, 11771355, 10463450, 9489145, 8508666, 8445674, 8440772, 10868391,
	12968357, 15134364, 16774557, 16769154, 16764032, 16755601,
];

export function getBlankSkin(): SkinData {
	return {
		layers: [],
		bc: DEFAULT_BASE_COLOR,
	};
}

export function getNewLayer(): SkinLayer {
	return {
		id: 1,
		scale: 0.25,
		angle: 0,
		x: 0,
		y: 0,
		flipX: false,
		flipY: false,
		color: 0,
	};
}
