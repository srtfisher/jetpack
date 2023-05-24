/*
 * External dependencies
 */
import { addFilter } from '@wordpress/hooks';

const EXTENDED_BLOCKS = [ 'core/paragraph', 'core/heading' ];

function multipleBlocksEdition( settings, name ) {
	if ( ! EXTENDED_BLOCKS.includes( name ) ) {
		return settings;
	}

	return {
		...settings,
		supports: {
			...settings.supports,
			'jetpack/ai': {
				assistant: true,
			},
		},
	};
}

// Extend BlockType.
addFilter(
	'blocks.registerBlockType',
	'jetpack/ai-assistant-multiple-blocks-edition',
	multipleBlocksEdition
);
