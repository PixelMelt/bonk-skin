import * as PIXI from 'pixi.js';
import type { SkinData } from '../types/types';

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

	render(skin: SkinData): void {
		const oldChildren = this.stage.removeChildren();
		for (const child of oldChildren) {
			child.destroy({ children: true });
		}

		const radius = this.size / 2;

		// Circular mask
		const mask = new PIXI.Graphics();
		mask.beginFill(0xffffff);
		mask.drawCircle(radius, radius, radius);
		mask.endFill();
		this.stage.addChild(mask);

		const content = new PIXI.Container();
		content.mask = mask;
		this.stage.addChild(content);

		// Base color
		const bg = new PIXI.Graphics();
		bg.beginFill(colorToNumber(skin.bc));
		bg.drawCircle(radius, radius, radius);
		bg.endFill();
		content.addChild(bg);

		const totalSize = radius / 15;

		for (let i = skin.layers.length - 1; i >= 0; i--) {
			const layer = skin.layers[i];
			const layerRadius = Math.abs(layer.scale) * totalSize * 30;
			const gfx = new PIXI.Graphics();
			gfx.beginFill(colorToNumber(layer.color));
			gfx.drawCircle(0, 0, layerRadius);
			gfx.endFill();

			gfx.x = radius + layer.x * totalSize;
			gfx.y = radius + layer.y * totalSize;
			gfx.angle = layer.angle;
			gfx.scale.x = layer.flipX ? -1 : 1;
			gfx.scale.y = layer.flipY ? -1 : 1;

			content.addChild(gfx);
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
		this.stage.destroy({ children: true });
		this.renderer.destroy();
	}
}
