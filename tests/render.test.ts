import { describe, it, expect } from 'bun:test';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { decodeSkin, renderToBuffer } from '../src/index';
import skins from './skins.json';

const testSkins = skins as string[];
const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe('renderToBuffer', () => {
	it('renders a random skin to a valid PNG buffer', async () => {
		const index = Math.floor(Math.random() * testSkins.length);
		const skin = decodeSkin(testSkins[index]);
		const buffer = await renderToBuffer(skin);

		expect(buffer).toBeInstanceOf(Buffer);
		expect(buffer.length).toBeGreaterThan(PNG_HEADER.length);
		expect(buffer.subarray(0, 8).equals(PNG_HEADER)).toBe(true);

		writeFileSync(join(__dirname, 'render-test.png'), buffer);
	});

	it('renders at a custom size', async () => {
		const index = Math.floor(Math.random() * testSkins.length);
		const skin = decodeSkin(testSkins[index]);
		const buffer = await renderToBuffer(skin, { size: 200 });

		expect(buffer).toBeInstanceOf(Buffer);
		expect(buffer.subarray(0, 8).equals(PNG_HEADER)).toBe(true);
	});
});
