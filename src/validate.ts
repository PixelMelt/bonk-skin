import type { SkinData, SkinLayer, ValidationIssue, ValidationResult } from './types/types';
import { decodeSkin } from './skin';

function issue(
	path: string,
	message: string,
	value?: unknown,
	constraint?: ValidationIssue['constraint'],
): ValidationIssue {
	return { path, message, value, constraint };
}

function checkRange(
	issues: ValidationIssue[],
	path: string,
	value: number,
	min: number,
	max: number,
): void {
	if (typeof value !== 'number' || Number.isNaN(value)) {
		issues.push(issue(path, `expected a number, got ${typeof value}`, value));
		return;
	}
	if (value < min || value > max) {
		issues.push(issue(path, `must be in [${min}, ${max}], got ${value}`, value, { min, max }));
	}
}

function toResult(issues: ValidationIssue[]): ValidationResult {
	return { valid: issues.length === 0, issues };
}

function _validateLayers(layers: SkinLayer[], issues: ValidationIssue[]): void {
	if (layers.length > 16) {
		issues.push(
			issue('layers', `count ${layers.length} exceeds maximum of 16`, layers.length, {
				max: 16,
			}),
		);
	}

	for (let i = 0; i < layers.length; i++) {
		const l = layers[i];
		const p = `layers[${i}]`;

		checkRange(issues, `${p}.id`, l.id, 1, 115);
		checkRange(issues, `${p}.scale`, l.scale, -10, 10);
		checkRange(issues, `${p}.angle`, l.angle, -9999, 9999);
		checkRange(issues, `${p}.x`, l.x, -99999, 99999);
		checkRange(issues, `${p}.y`, l.y, -99999, 99999);
		checkRange(issues, `${p}.color`, l.color, 0, 16777215);

		if (typeof l.flipX !== 'boolean') {
			issues.push(issue(`${p}.flipX`, `expected a boolean, got ${typeof l.flipX}`, l.flipX));
		}
		if (typeof l.flipY !== 'boolean') {
			issues.push(issue(`${p}.flipY`, `expected a boolean, got ${typeof l.flipY}`, l.flipY));
		}
	}
}

export function validateLayers(layers: SkinLayer[]): ValidationResult {
	const issues: ValidationIssue[] = [];
	_validateLayers(layers, issues);
	return toResult(issues);
}

export function validateSkin(skin: SkinData): ValidationResult {
	const issues: ValidationIssue[] = [];

	checkRange(issues, 'bc', skin.bc, 0, 16777215);
	_validateLayers(skin.layers, issues);

	return toResult(issues);
}

export function decodeAndValidate(encoded: string): {
	skin: SkinData;
	validation: ValidationResult;
} {
	const skin = decodeSkin(encoded);
	const validation = validateSkin(skin);
	return { skin, validation };
}
