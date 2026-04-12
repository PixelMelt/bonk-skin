import * as PIXI from 'pixi.js';
import type { SkinData } from '../types/types';
import { svgStrings } from './svgs';

const SVG_OVERSAMPLE = 2;

export interface SkinRendererOptions {
	size?: number;
	antialias?: boolean;
	resolution?: number;
}

function colorToNumber(color: number): number {
	return color & 0xffffff;
}

export class SkinRenderer {
	private renderer: PIXI.IRenderer;
	private stage: PIXI.Container;
	private size: number;

	constructor(options?: SkinRendererOptions) {
		this.size = options?.size ?? 100;

		this.renderer = PIXI.autoDetectRenderer({
			width: this.size,
			height: this.size,
			antialias: options?.antialias ?? true,
			resolution: options?.resolution ?? 1,
			autoDensity: true,
			powerPreference: 'high-performance',
			backgroundColor: 0x000000,
			backgroundAlpha: 0,
		});

		this.stage = new PIXI.Container();
	}

	async render(skin: SkinData): Promise<void> {
		const oldChildren = this.stage.removeChildren();
		for (const child of oldChildren) {
			child.destroy({ children: true, texture: true, baseTexture: true });
		}

		const radius = this.size / 2;
		const totalSize = radius / 15;

		// Circular mask
		const mask = new PIXI.Graphics();
		mask.beginFill(0xffffff);
		mask.drawCircle(radius, radius, radius);
		mask.endFill();
		this.stage.addChild(mask);

		const content = new PIXI.Container();
		content.mask = mask;
		this.stage.addChild(content);

		const bg = new PIXI.Graphics();
		bg.beginFill(colorToNumber(skin.bc));
		bg.drawRect(0, 0, this.size, this.size);
		bg.endFill();
		content.addChild(bg);

		for (let i = skin.layers.length - 1; i >= 0; i--) {
			const layer = skin.layers[i];
			const dataUri = svgStrings[layer.id];
			if (!dataUri) continue;

			const svgScale = Math.abs(layer.scale) * totalSize * SVG_OVERSAMPLE;
			if (svgScale <= 0) continue;

			const resource = new PIXI.SVGResource(dataUri, {
				scale: svgScale,
				autoLoad: false,
			});
			await resource.load();

			const baseTexture = new PIXI.BaseTexture(resource);
			const texture = new PIXI.Texture(baseTexture);
			const sprite = new PIXI.Sprite(texture);

			sprite.tint = colorToNumber(layer.color);
			sprite.anchor.set(0.5);
			sprite.x = radius + layer.x * totalSize;
			sprite.y = radius + layer.y * totalSize;
			sprite.angle = layer.angle;
			sprite.scale.x = (1 / SVG_OVERSAMPLE) * (layer.flipX ? -1 : 1);
			sprite.scale.y = (1 / SVG_OVERSAMPLE) * (layer.flipY ? -1 : 1);

			content.addChild(sprite);
		}

		this.renderer.render(this.stage);
	}

	get canvas(): HTMLCanvasElement {
		return this.renderer.view as HTMLCanvasElement;
	}

	resize(size: number): void {
		this.size = size;
		this.renderer.resize(size, size);
	}

	destroy(): void {
		this.stage.destroy({ children: true, texture: true, baseTexture: true });
		this.renderer.destroy();
	}
}
