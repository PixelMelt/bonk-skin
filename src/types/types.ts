export interface SkinLayer {
	id: number;
	scale: number;
	angle: number;
	x: number;
	y: number;
	flipX: boolean;
	flipY: boolean;
	color: number;
}

export interface SkinData {
	layers: SkinLayer[];
	bc: number;
}

export interface ValidationIssue {
	path: string;
	message: string;
	value?: unknown;
	constraint?: {
		min?: number;
		max?: number;
		maxLength?: number;
	};
}

export interface ValidationResult {
	valid: boolean;
	issues: ValidationIssue[];
}
