# bonk-skin

Encode, decode, validate, and render [bonk.io](https://bonk.io) skins.

## Install

```bash
npm install bonk-skin
```

## Encoding & Decoding

Convert between the bonk.io skin string format and a typed `SkinData` object.

```ts
import { decodeSkin, encodeSkin } from 'bonk-skin';

const skin = decodeSkin(skinString);
console.log(skin.bc);
console.log(skin.layers);

const encoded = encodeSkin(skin);
```

## Skin Format

A skin consists of a base color and up to 16 layers. Each layer references one of 115 SVG shapes with positioning, scaling, rotation, flip, and color properties.

```ts
import type { SkinData, SkinLayer } from 'bonk-skin';

// SkinData
//   bc: number (base color, 0-16777215)
//   layers: SkinLayer[]
//     id: number (shape ID, 1-115)
//     scale: number (-10 to 10)
//     angle: number (-9999 to 9999)
//     x: number (-99999 to 99999)
//     y: number (-99999 to 99999)
//     flipX: boolean
//     flipY: boolean
//     color: number (0-16777215)
```

## Validation

Validate a skin or its layers. Every validator returns a `ValidationResult` with `valid` and `issues`.

```ts
import { validateSkin, decodeAndValidate } from 'bonk-skin';

const result = validateSkin(skin);
if (!result.valid) {
	for (const issue of result.issues) {
		console.log(`${issue.path}: ${issue.message}`);
	}
}

// Decode and validate in one step
const { skin, validation } = decodeAndValidate(skinString);
```

Section-level validators are also available:

```ts
import { validateLayers } from 'bonk-skin';

validateLayers(skin.layers);
```

## Rendering

### Node / Bun

`renderToBuffer` uses `@napi-rs/canvas` to produce a PNG buffer without a browser.

```ts
import { decodeSkin, renderToBuffer } from 'bonk-skin';
import { writeFileSync } from 'fs';

const skin = decodeSkin(skinString);
const png = renderToBuffer(skin);
writeFileSync('skin.png', png);

// Custom size
const large = renderToBuffer(skin, { size: 200 });
```

### Browser using PIXI.js

`SkinRenderer` wraps a PIXI renderer and provides a canvas element you can insert into the DOM.

```ts
import { decodeSkin, SkinRenderer } from 'bonk-skin';

const renderer = new SkinRenderer({ size: 100 });
document.body.appendChild(renderer.canvas);

const skin = decodeSkin(skinString);
renderer.render(skin);

// Resize
renderer.resize(200);
renderer.render(skin);

// Cleanup
renderer.destroy();
```

## Templates

Create new skin objects defaults.

```ts
import { getBlankSkin, getNewLayer, DEFAULT_BASE_COLOR, DEFAULT_COLORS } from 'bonk-skin';

const skin = getBlankSkin();
// { layers: [], bc: 4492031 }

const layer = getNewLayer();
// { id: 1, scale: 0.25, angle: 0, x: 0, y: 0, flipX: false, flipY: false, color: 0 }

skin.layers.push(layer);
```

## Types

All interfaces are exported for use in TypeScript:

```ts
import type {
	SkinData,
	SkinLayer,
	ValidationResult,
	ValidationIssue,
	SkinRendererOptions,
	RenderToBufferOptions,
} from 'bonk-skin';
```

## License

GPL3
