import { createCanvas, loadImage, type Image as CanvasImage } from '@napi-rs/canvas';
import type { SkinData } from '../types/types';
import svgData from './svgs.json';

const DEFAULT_SIZE = 100;
const TWO_PI = Math.PI * 2;
const DEG_TO_RAD = Math.PI / 180;

const svgStrings = svgData as Record<string, string>;

const imageCache = new Map<number, CanvasImage>();

async function getSvgImage(id: number): Promise<CanvasImage | null> {
	const cached = imageCache.get(id);
	if (cached) return cached;

	const dataUri = svgStrings[id];
	if (!dataUri) return null;

	const img = await loadImage(dataUri);
	imageCache.set(id, img);
	return img;
}

function colorToHex(color: number): string {
	return '#' + color.toString(16).padStart(6, '0');
}

export interface RenderToBufferOptions {
	size?: number;
}

export async function renderToBuffer(
	skin: SkinData,
	options?: RenderToBufferOptions,
): Promise<Buffer> {
	const size = options?.size ?? DEFAULT_SIZE;
	const radius = size / 2;
	const totalSize = radius / 15;

	const canvas = createCanvas(size, size);
	const ctx = canvas.getContext('2d');

	ctx.beginPath();
	ctx.arc(radius, radius, radius, 0, TWO_PI);
	ctx.clip();

	ctx.fillStyle = colorToHex(skin.bc);
	ctx.fillRect(0, 0, size, size);

	for (let i = skin.layers.length - 1; i >= 0; i--) {
		const layer = skin.layers[i];
		const img = await getSvgImage(layer.id);
		if (!img) continue;

		const effectiveScale = Math.abs(layer.scale) * totalSize;
		const drawW = img.width * effectiveScale;
		const drawH = img.height * effectiveScale;

		const tmp = createCanvas(Math.max(1, Math.ceil(drawW)), Math.max(1, Math.ceil(drawH)));
		const tctx = tmp.getContext('2d');
		tctx.drawImage(img, 0, 0, drawW, drawH);
		tctx.globalCompositeOperation = 'source-in';
		tctx.fillStyle = colorToHex(layer.color);
		tctx.fillRect(0, 0, drawW, drawH);

		ctx.save();
		ctx.translate(radius + layer.x * totalSize, radius + layer.y * totalSize);
		ctx.rotate(layer.angle * DEG_TO_RAD);
		ctx.scale(layer.flipX ? -1 : 1, layer.flipY ? -1 : 1);
		ctx.drawImage(tmp, -drawW / 2, -drawH / 2, drawW, drawH);
		ctx.restore();
	}

	return canvas.toBuffer('image/png');
}
