<?php
/**
 * Module Name: Google Fonts (Beta)
 * Module Description: A selection of Google fonts for block enabled themes. This feature is still being developed.
 * Sort Order: 1
 * Recommendation Order: 2
 * First Introduced: 10.8.0
 * Requires Connection: No
 * Auto Activate: No
 * Module Tags: Fonts, Recommended
 * Feature: Writing
 * Additional Search Queries: fonts, webfonts, typography
 *
 * @package automattic/jetpack
 */

/**
 * Curated list of Google Fonts
 * See https://wp.me/p9Jlb4-22P
 */
const JETPACK_GOOGLE_FONTS_LIST = array(
	'Arvo',
	'Bodoni Moda',
	'Cabin',
	'Chivo',
	'Courier Prime',
	'DM Sans',
	'Domine',
	'EB Garamond',
	'Fira Sans',
	'IBM Plex Sans',
	'IBM Plex Mono',
	'Inter',
	'Josefin Sans',
	'Jost',
	'Libre Baskerville',
	'Libre Franklin',
	'Literata',
	'Lora',
	'Merriweather',
	'Montserrat',
	'Newsreader',
	'Nunito',
	'Open Sans',
	'Overpass',
	'Playfair Display',
	'Poppins',
	'Raleway',
	'Roboto',
	'Roboto Slab',
	'Rubik',
	'Source Sans Pro',
	'Source Serif Pro',
	'Space Mono',
	'Texturina',
	'Work Sans',
);

// Fonts not available on Google and shipped with Jetpack instead
const JETPACK_LOCAL_FONTS = array(
	// 'Uncut Sans', // Asking to add package.json first: https://github.com/kaspernordkvist/uncut_sans/pull/1
	'Metropolis',
);

/**
 * Register a curated selection of Google Fonts.
 *
 * @return void
 */
function jetpack_add_google_fonts_provider() {
	if ( ! function_exists( 'wp_register_webfont_provider' ) || ! function_exists( 'wp_register_webfonts' ) ) {
		return;
	}

	wp_register_webfont_provider( 'jetpack-google-fonts', '\Automattic\Jetpack\Fonts\Google_Fonts_Provider' );

	/**
	 * Curated list of Google Fonts.
	 *
	 * @module google-fonts
	 *
	 * @since 10.8
	 *
	 * @param array $fonts_to_register Array of Google Font names to register.
	 */
	$fonts_to_register = apply_filters( 'jetpack_google_fonts_list', JETPACK_GOOGLE_FONTS_LIST );

	foreach ( $fonts_to_register as $font_family ) {
		wp_register_webfonts(
			array(
				array(
					'font-family'  => $font_family,
					'font-weight'  => '100 900',
					'font-style'   => 'normal',
					'font-display' => 'fallback',
					'provider'     => 'jetpack-google-fonts',
				),
				array(
					'font-family'  => $font_family,
					'font-weight'  => '100 900',
					'font-style'   => 'italic',
					'font-display' => 'fallback',
					'provider'     => 'jetpack-google-fonts',
				),
			)
		);
	}

	/**
	 * Curated list of locally hosted fonts.
	 *
	 * @module google-fonts
	 *
	 * @since 10.8
	 *
	 * @param array $fonts_to_register Array of font names to register.
	 */
	$fonts_to_register_locally = apply_filters( 'jetpack_google_fonts_list', JETPACK_LOCAL_FONTS );

	foreach ( $fonts_to_register_locally as $font_family ) {
		wp_register_webfonts(
			array(
				array(
					'font-family'  => $font_family,
					'font-weight'  => '100 900',
					'font-style'   => 'normal',
					'font-display' => 'fallback',
					'provider'     => 'local',
					'src'          => array(
						plugins_url( 'google-fonts/fonts/@chrismsimpson/metropolis/Fonts/Webfonts/woff2/Metropolis-Regular.woff2', __FILE__ ),
					),
				),
				array(
					'font-family'  => $font_family,
					'font-weight'  => '100 900',
					'font-style'   => 'italic',
					'font-display' => 'fallback',
					'provider'     => 'local',
					'src'          => array(
						plugins_url( 'google-fonts/fonts/@chrismsimpson/metropolis/Fonts/Webfonts/woff2/Metropolis-RegularItalic.woff2', __FILE__ ),
					),
				),
			)
		);
	}
}
add_action( 'after_setup_theme', 'jetpack_add_google_fonts_provider' );

add_filter( 'wp_resource_hints', '\Automattic\Jetpack\Fonts\Utils::font_source_resource_hint', 10, 2 );
add_filter( 'pre_render_block', '\Automattic\Jetpack\Fonts\Introspectors\Blocks::enqueue_block_fonts', 10, 2 );
// The priority for the next hook is is set to 22 because it needs to run after Gutenberg's
// re-registration (at priority 22) of the core blocks it de-registers (at the default priority 10),
// otherwise Gutenberg caches an incorrect state.
add_action( 'init', '\Automattic\Jetpack\Fonts\Introspectors\Global_Styles::enqueue_global_styles_fonts', 22 );
