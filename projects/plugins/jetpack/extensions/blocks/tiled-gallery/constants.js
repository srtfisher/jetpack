/**
 * WordPress dependencies
 */
import { Platform } from '@wordpress/element';

export const ALLOWED_MEDIA_TYPES = [ 'image' ];
export const DEFAULT_GALLERY_WIDTH = 580;
export const GUTTER_WIDTH = 4;
export const MAX_COLUMNS = 20;
export const MAX_ROUNDED_CORNERS = 20;
export const PHOTON_MAX_RESIZE = 2000;

/**
 * Layouts
 */
export const LAYOUT_CIRCLE = 'circle';
export const LAYOUT_COLUMN = 'columns';
export const LAYOUT_DEFAULT = 'rectangular';
export const LAYOUT_SQUARE = 'square';
export const LAYOUT_STYLES = [
	{
		isDefault: Platform.OS === 'web',
		name: LAYOUT_DEFAULT,
	},
	{
		name: LAYOUT_CIRCLE,
	},
	{
		isDefault: Platform.OS === 'native',
		name: LAYOUT_SQUARE,
	},
	{
		name: LAYOUT_COLUMN,
	},
];
