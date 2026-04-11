import { byteBuffer } from './util/byteBuffer';
import type { SkinData, SkinLayer } from './types/types';
import { getBlankSkin, DEFAULT_BASE_COLOR } from './templates';

const SKIN_VERSION = 2;

export function encodeSkin(skin: SkinData): string {
	const buf = new byteBuffer();

	buf.writeByte(0x0a);
	buf.writeByte(0x07);
	buf.writeByte(0x03);
	buf.writeByte(0x61);

	buf.writeShort(SKIN_VERSION);

	buf.writeByte(0x09);
	buf.writeByte(skin.layers.length * 2 + 1);
	buf.writeByte(0x01);

	for (let i = 0; i < skin.layers.length; i++) {
		const layer = skin.layers[i];

		buf.writeByte(0x0a);
		if (i === 0) {
			buf.writeByte(0x07);
			buf.writeByte(0x05);
			buf.writeByte(0x61);
			buf.writeByte(0x6c);
		} else {
			buf.writeByte(0x05);
		}

		buf.writeShort(1);
		buf.writeShort(layer.id);
		buf.writeFloat(layer.scale);
		buf.writeFloat(layer.angle);
		buf.writeFloat(layer.x);
		buf.writeFloat(layer.y);
		buf.writeBoolean(layer.flipX);
		buf.writeBoolean(layer.flipY);
		buf.writeInt(layer.color);
	}

	buf.writeInt(skin.bc);

	const base64 = buf.toBase64();
	return encodeURIComponent(base64);
}

export function decodeSkin(encoded: string): SkinData {
	if (!encoded) {
		return getBlankSkin();
	}

	try {
		const base64 = decodeURIComponent(encoded);
		const buf = new byteBuffer();
		buf.fromBase64(base64);

		const skin = getBlankSkin();

		buf.readByte(); // 0x0A
		buf.readByte(); // 0x07
		buf.readByte(); // 0x03
		buf.readByte(); // 0x61

		const version = buf.readShort();

		buf.readByte(); // 0x09
		const layerCountByte = buf.readByte();
		const layerCount = (layerCountByte - 1) / 2;

		let marker = buf.readByte();
		while (marker !== 1) {
			let index = 0;
			if (marker === 3) {
				index = buf.readByte() - 48;
			} else if (marker === 5) {
				const tens = buf.readByte() - 48;
				const ones = buf.readByte() - 48;
				index = tens * 10 + ones;
			}
			skin.layers[index] = readLayer(buf);
			marker = buf.readByte();
		}

		for (let i = 0; i < layerCount; i++) {
			skin.layers[i] = readLayer(buf);
		}

		if (version >= 2) {
			skin.bc = buf.readInt();
		}

		makeSafe(skin);
		return skin;
	} catch {
		return getBlankSkin();
	}
}

function readLayer(buf: byteBuffer): SkinLayer {
	const typeByte = buf.readByte();
	const typeHex = typeByte.toString(16);

	if (typeHex !== 'a') {
		return { id: 1, scale: 0.25, angle: 0, x: 0, y: 0, flipX: false, flipY: false, color: 0 };
	}

	const secondByte = buf.readByte();
	if (secondByte === 7) {
		buf.readByte();
		buf.readByte();
		buf.readByte();
	}

	buf.readShort();

	return {
		id: buf.readShort(),
		scale: buf.readFloat(),
		angle: buf.readFloat(),
		x: buf.readFloat(),
		y: buf.readFloat(),
		flipX: buf.readBoolean(),
		flipY: buf.readBoolean(),
		color: buf.readInt(),
	};
}

function makeSafe(skin: SkinData): void {
	if (!(skin.bc >= 0 && skin.bc <= 16777215)) {
		skin.bc = DEFAULT_BASE_COLOR;
	}

	for (let i = 0; i < skin.layers.length; i++) {
		const layer = skin.layers[i];
		if (!layer) {
			skin.layers.splice(i, 1);
			i--;
			continue;
		}
		if (!(layer.id >= 1 && layer.id <= 115)) layer.id = 1;
		if (!(layer.x >= -99999 && layer.x <= 99999)) layer.x = 0;
		if (!(layer.y >= -99999 && layer.y <= 99999)) layer.y = 0;
		if (!(layer.scale >= -10 && layer.scale <= 10)) layer.scale = 0.25;
		if (!(layer.angle >= -9999 && layer.angle <= 9999)) layer.angle = 0;
		if (typeof layer.flipX !== 'boolean') layer.flipX = false;
		if (typeof layer.flipY !== 'boolean') layer.flipY = false;
		if (!(layer.color >= 0 && layer.color <= 16777215)) layer.color = 0;
	}

	if (skin.layers.length > 16) {
		skin.layers.length = 16;
	}
}
