import { getJetpackData } from '@automattic/jetpack-shared-extension-utils';
import { select } from '@wordpress/data';
import { store as editorStore } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { get, isEqual } from 'lodash';
import createSelector from 'rememo';
import { SUPPORTED_BLOCKS, SUPPORTED_CONTAINER_BLOCKS } from '../components/twitter';

// Links and media attached to tweets take up 24 characters each.
const ATTACHMENT_MESSAGE_PADDING = 24;

// The maximum length is 280 characters, but there'll always be a URL attached (plus a space).
const MAXIMUM_MESSAGE_LENGTH = 280 - ATTACHMENT_MESSAGE_PADDING - 1;

const DEFAULT_TWEETSTORM_MESSAGE = '\n\n' + __( 'A thread ⬇️', 'jetpack' );

/**
 * Returns the failed Publicize connections.
 *
 * @returns {Array} List of connections.
 */
export function getFailedConnections() {
	const connections = getConnections();
	return connections.filter( connection => false === connection.test_success );
}

/**
 * Returns a list of Publicize connection service names that require reauthentication from users.
 * iFor example, when LinkedIn switched its API from v1 to v2.
 *
 * @returns {Array} List of service names that need reauthentication.
 */
export function getMustReauthConnections() {
	const connections = getConnections();
	return connections
		.filter( connection => 'must_reauth' === connection.test_success )
		.map( connection => connection.service_name );
}

/**
 * Returns a template for linkedIn data, based on the first linkedin account found.
 *
 * @param {object} args - Arguments.
 * @param {boolean} args.forceDefaults - Whether to use default values.
 * @returns {object} The linkedin account data.
 */
export function getLinkedInDetails( { forceDefaults = false } = {} ) {
	if ( ! forceDefaults ) {
		const connection = getConnections().find( ( { service_name } ) => 'linkedin' === service_name );

		if ( connection ) {
			return {
				name: connection.display_name,
				profileImage: connection.profile_picture,
			};
		}
	}

	return {
		name: __( 'Account Name', 'jetpack' ),
		profileImage:
			"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128' id='person-accent-4'%3E%3Cpath fill='%23e7e2dc' d='M0 0h128v128H0z'/%3E%3Cpath d='M88.41 84.67a32 32 0 10-48.82 0 66.13 66.13 0 0148.82 0z' fill='%23788fa5'/%3E%3Cpath d='M88.41 84.67a32 32 0 01-48.82 0A66.79 66.79 0 000 128h128a66.79 66.79 0 00-39.59-43.33z' fill='%239db3c8'/%3E%3Cpath d='M64 96a31.93 31.93 0 0024.41-11.33 66.13 66.13 0 00-48.82 0A31.93 31.93 0 0064 96z' fill='%2356687a'/%3E%3C/svg%3E",
	};
}

/**
 * Returns a template for Instagram data, based on the first Instagram account found.
 *
 * @returns {{name: string; profileImage: string}} The Instagram account data.
 */
export function getInstagramDetails() {
	const connection = getConnections().find(
		( { service_name } ) => 'instagram-business' === service_name
	);

	if ( connection ) {
		return {
			name: connection.username,
			profileImage: connection.profile_picture,
		};
	}

	return {
		name: 'username',
		profileImage: '',
	};
}

/**
 * Returns a template for tweet data, based on the first Twitter account found.
 *
 * @param {object} state - State object.
 * @returns {object} The Twitter account data.
 */
export function getTweetTemplate( state ) {
	/*
	 * state.connections is not used anymore,
	 * since they are stored into the post meta.
	 * This is kept for backward compatibility,
	 * especially for the selector tests.
	 * it should be removed in the future.
	 * Take a look at the getTweetstormHelper
	 * helper for more details,
	 */
	const connections = state.connections || getConnections();
	const twitterAccount = connections?.find( connection => 'twitter' === connection.service_name );

	return {
		date: Date.now(),
		name: twitterAccount?.profile_display_name || __( 'Account Name', 'jetpack' ),
		profileImage:
			twitterAccount?.profile_picture ||
			'https://abs.twimg.com/sticky/default_profile_images/default_profile_bigger.png',
		screenName: twitterAccount?.display_name || '@account',
	};
}

/**
 * Generates an array of tweets, including Twitter account data.
 *
 * @param {object} state - State object.
 * @returns {Array} Array of tweets.
 */
export function getTweetStorm( state ) {
	const tweetTemplate = getTweetTemplate( state );

	const thread = [
		getFirstTweet( state ),
		...state.tweets.slice( 0, 100 ).map( tweet => ( {
			...tweetTemplate,
			text: tweet.text,
			media: tweet.media,
			tweet: tweet.tweet,
			urls: tweet.urls,
			...getTwitterCardForURLs( state, tweet.urls ),
		} ) ),
	];

	// Only add the last tweet if there's actual content in the thread.
	if ( thread.length > 1 ) {
		thread.push( getLastTweet( state ) );
	}

	return thread;
}

/**
 * Constructs the first tweet to use in the thread.
 *
 * @param {object} state - State object.
 * @returns {object|undefined} The tweet.
 */
export function getFirstTweet( state ) {
	// This isn't defined properly in the test environment, so we have to skip this function.
	if ( ! select( 'core' ) ) {
		return undefined;
	}

	const tweetTemplate = getTweetTemplate( state );

	const { getMedia } = select( 'core' );
	const { getEditedPostAttribute } = select( 'core/editor' );

	const featuredImageId = getEditedPostAttribute( 'featured_media' );
	const url = getEditedPostAttribute( 'link' );

	const media = featuredImageId && getMedia( featuredImageId );
	const image = media?.media_details?.sizes?.large?.source_url || media?.source_url;

	return {
		...tweetTemplate,
		text: getShareMessage() + ` ${ url }`,
		urls: [ url ],
		title: getEditedPostAttribute( 'title' ),
		description:
			getEditedPostAttribute( 'meta' )?.advanced_seo_description ||
			getEditedPostAttribute( 'excerpt' ) ||
			getEditedPostAttribute( 'content' ).split( '<!--more' )[ 0 ] ||
			__( 'Visit the post for more.', 'jetpack' ),
		url,
		image,
		cardType: image ? 'summary_large_image' : 'summary',
	};
}

/**
 * Constructs the last tweet to use in the thread.
 *
 * @param {object} state - State object.
 * @returns {object|undefined} The tweet.
 */
export function getLastTweet( state ) {
	// This isn't defined properly in the test environment, so we have to skip this function.
	if ( ! select( 'core/editor' ) ) {
		return undefined;
	}

	const { getEditedPostAttribute } = select( 'core/editor' );
	const url = getEditedPostAttribute( 'link' );

	const message =
		state.tweets.length > 100
			? __( 'The rest of this thread can be read here:', 'jetpack' )
			: __( 'This thread can be read here:', 'jetpack' );

	return {
		...getFirstTweet( state ),
		// The URL is deliberately not included in the translatable string, as it must always
		// be the last thing in the tweet text.
		text: `${ message } ${ url }`,
	};
}

/**
 * If the passed block type is supported, returns the supported block definition.
 *
 * @param {object} state - State object.
 * @param {string} blockName - The name of the registered block type.
 * @returns {object} The supported block definition. If the block type is unsupported, returns undefined.
 */
export function getSupportedBlockType( state, blockName ) {
	if ( SUPPORTED_BLOCKS[ blockName ] ) {
		return SUPPORTED_BLOCKS[ blockName ];
	}

	return undefined;
}

/**
 * Returns the tweets that a particular block is part of.
 *
 * @param {object} state - State object.
 * @param {string} clientId - The clientId of the block.
 * @returns {Array} The tweets.
 */
export const getTweetsForBlock = createSelector(
	( state, clientId ) => {
		return state.tweets.filter( tweet => {
			if ( tweet.blocks.find( block => block.clientId === clientId ) ) {
				return true;
			}

			return false;
		} );
	},
	state => [ state.tweets ]
);

/**
 * Given a list of URLs, this will find the first available Twitter card.
 *
 * @param {object} state - State object.
 * @param {Array} urls - The URLs to find Twitter Card data for.
 * @returns {object} The first available Twitter Card for the given URLs.
 */
export function getTwitterCardForURLs( state, urls ) {
	if ( ! urls ) {
		return undefined;
	}

	return urls.reduce( ( foundCard, url ) => {
		if ( foundCard ) {
			return foundCard;
		}

		if ( state.twitterCards[ url ] && ! state.twitterCards[ url ].error ) {
			return {
				url,
				...state.twitterCards[ url ],
			};
		}

		return undefined;
	}, undefined );
}

/**
 * Check if we already have a Twitter Card (or error) cached for a given URL already.
 *
 * @param {object} state - State object.
 * @param {string} url - The URL to check.
 * @returns {boolean} Whether or not we have something for the URL.
 */
export function twitterCardIsCached( state, url ) {
	return !! state.twitterCards[ url ];
}

/**
 * Gets the message that will be used hen sharing this post.
 *
 * @returns {string} The share message.
 */
export function getShareMessage() {
	const { getEditedPostAttribute } = select( 'core/editor' );
	const meta = getEditedPostAttribute( 'meta' );
	const postTitle = getEditedPostAttribute( 'title' );
	const message = get( meta, [ 'jetpack_publicize_message' ], '' );

	if ( message ) {
		return message.substr( 0, getShareMessageMaxLength() );
	}

	if ( isTweetStorm() ) {
		if ( postTitle ) {
			return postTitle.substr( 0, getShareMessageMaxLength() ) + DEFAULT_TWEETSTORM_MESSAGE;
		}
	}

	return '';
}

/**
 * Get the maximum length that a share message can be.
 *
 * @returns {number} The maximum length of a share message.
 */
export function getShareMessageMaxLength() {
	if ( ! isTweetStorm() ) {
		return MAXIMUM_MESSAGE_LENGTH;
	}

	return MAXIMUM_MESSAGE_LENGTH - DEFAULT_TWEETSTORM_MESSAGE.length;
}

/**
 * Check whether or not this post will be published as a tweetstorm.
 *
 * @returns {boolean} Whether or not it's a tweetstorm.
 */
export function isTweetStorm() {
	return !! select( 'core/editor' ).getEditedPostAttribute( 'meta' )?.jetpack_is_tweetstorm;
}

/**
 * Finds the boundary definitions for a given block.
 *
 * @param {object} state - State object.
 * @param {string} clientId - The block clientId.
 * @returns {Array} The boundary definitions.
 */
export const getBoundariesForBlock = createSelector(
	( state, clientId ) => {
		if ( ! isTweetStorm() ) {
			return [];
		}

		const tweets = getTweetsForBlock( state, clientId );

		if ( ! tweets || tweets.length === 0 ) {
			return [];
		}

		return tweets.filter( tweet => tweet.boundary ).map( tweet => tweet.boundary );
	},
	state => [ state.tweets ]
);

/**
 * Helper function for computing an exact selector for the given element within a block.
 *
 * @param {Node} element - The DOM element to find a selector  for.
 * @param {string} clientId - The clientId of the containing block.
 * @returns {string} The selector to access the given element.
 */
function computeSelector( element, clientId ) {
	// We've found the block node, we can return now.
	if ( `block-${ clientId }` === element.id ) {
		return `#block-${ clientId }`;
	}

	const parent = element.parentNode;
	const index = Array.prototype.indexOf.call( parent.children, element );

	return computeSelector( parent, clientId ) + ` > :nth-child( ${ index + 1 } )`;
}

/**
 * Returns an array of CSS selectors to be used for adding end-of-line boundaries.
 *
 * @param {object} state - State object.
 * @param {string} clientId - The clientId of the containing block.
 * @returns {Array} An array of CSS selectors.
 */
export const getBoundaryStyleSelectors = createSelector(
	( state, clientId ) => {
		const boundaries = getBoundariesForBlock( state, clientId );

		const blockElement = document.getElementById( `block-${ clientId }` );

		return boundaries
			.filter( boundary => 'end-of-line' === boundary.type )
			.map( boundary => {
				// When switching from code to visual editor, the block may not've been re-added to the DOM yet.
				if ( ! blockElement ) {
					return false;
				}

				const line = blockElement.getElementsByTagName( 'li' ).item( boundary.line );

				// Confirm that the line hasn't been deleted since this boundary was calculated.
				if ( line ) {
					return computeSelector( line, clientId );
				}

				return false;
			} )
			.filter( style => !! style );
	},
	state => [ state.tweets ]
);

/**
 * Helper function to check whether or not there are any tags in the content attributes
 * for this particular block.
 *
 * @param {object} state - State object.
 * @param {object} props - The block props.
 * @param {Array} tags - An array of the tag names to look for.
 * @returns {boolean} Whether or not any of the given tags were found.
 */
export function checkForTagsInContentAttributes( state, props, tags ) {
	if ( 0 === tags.length ) {
		return false;
	}

	if ( ! getSupportedBlockType( state, props.name )?.contentAttributes ) {
		return false;
	}

	const tagRegexp = new RegExp( `<(${ tags.join( '|' ) })( |>|/>)`, 'gi' );
	return getSupportedBlockType( state, props.name ).contentAttributes.reduce(
		( found, attribute ) => {
			if ( found ) {
				return true;
			}

			return tagRegexp.test( props.attributes[ attribute ] );
		},
		false
	);
}

/**
 * If now's a good time to show popover warnings, return an array of warnings. If now isn't a good time,
 * an empty array will be returned.
 *
 * @param {object} state - State object.
 * @param {object} props - The props for the block to check for warnings.
 * @returns {Array} An array of warnings to show.
 */
export const getPopoverWarnings = createSelector(
	( state, props ) => {
		const {
			isTyping,
			isDraggingBlocks,
			isMultiSelecting,
			hasMultiSelection,
			isCaretWithinFormattedText,
		} = select( 'core/block-editor' );

		if ( ! isTweetStorm() ) {
			return [];
		}

		// Don't show any popovers if the author is doing something else.
		if (
			isTyping() ||
			isDraggingBlocks() ||
			isMultiSelecting() ||
			hasMultiSelection() ||
			isCaretWithinFormattedText()
		) {
			return [];
		}

		const popoverWarnings = [];
		if (
			! getSupportedBlockType( state, props.name ) &&
			! SUPPORTED_CONTAINER_BLOCKS[ props.name ]
		) {
			popoverWarnings.push( __( 'This block is not exportable to Twitter', 'jetpack' ) );
		} else {
			if ( 'core/gallery' === props.name && props.attributes.images.length > 4 ) {
				popoverWarnings.push( __( 'Twitter displays the first four images.', 'jetpack' ) );
			}

			if (
				checkForTagsInContentAttributes( state, props, [
					'strong',
					'bold',
					'em',
					'i',
					'sup',
					'sub',
					'span',
					's',
				] )
			) {
				popoverWarnings.push( __( 'Twitter removes all text formatting.', 'jetpack' ) );
			}

			if ( checkForTagsInContentAttributes( state, props, [ 'a' ] ) ) {
				popoverWarnings.push( __( 'Links will be posted seperately.', 'jetpack' ) );
			}
		}

		return popoverWarnings;
	},
	state => [ state.tweets ]
);

/**
 * Determines whether the passed block is the boundary for the tweet containing the currently selected block.
 *
 * @param {object} state - State object.
 * @param {object} props - The block to check.
 * @returns {boolean} Whether or not the passed block is the boundary.
 */
export function isSelectedTweetBoundary( state, props ) {
	const { isBlockSelected } = select( 'core/block-editor' );

	if ( ! isTweetStorm() ) {
		return false;
	}

	const supportedBlock = getSupportedBlockType( state, props.name );
	const tweets = getTweetsForBlock( state, props.clientId );

	if ( ! tweets || tweets.length === 0 ) {
		return false;
	}

	const lastTweet = tweets[ tweets.length - 1 ];

	// The current block is the selected tweet boundary when either of these are true:
	// - The current block is selected, and it's not a block type we support.
	// - It's the last block in the last tweet, and the currently selected block is also in the same set of tweets.
	return (
		( isBlockSelected( props.clientId ) && ! supportedBlock ) ||
		( lastTweet.blocks[ lastTweet.blocks.length - 1 ].clientId === props.clientId &&
			tweets.some( tweet => tweet.blocks.some( block => isBlockSelected( block.clientId ) ) ) )
	);
}

/**
 * Checks whether or not the content attributes have changed, given the prevProps, and props.
 *
 * @param {object} state - State object.
 * @param {object} prevProps - The previous props.
 * @param {object} props - The current props.
 * @returns {boolean} Whether or not the content attributes in this block have changed.
 */
export function contentAttributesChanged( state, prevProps, props ) {
	const supportedBlockType = getSupportedBlockType( state, props.name );
	if ( ! supportedBlockType ) {
		return false;
	}

	const attributeNames = supportedBlockType.contentAttributes;
	return ! isEqual(
		attributeNames.map( attribute => ( {
			attribute,
			content: prevProps.attributes[ attribute ],
		} ) ),
		attributeNames.map( attribute => ( { attribute, content: props.attributes[ attribute ] } ) )
	);
}

/**
 * Return social media connections.
 * This selector consumes the post metadata like primary source data.
 *
 * @returns {Array} An array of fresh social media connections for the current post.
 */
export function getConnections() {
	return select( editorStore ).getEditedPostAttribute( 'jetpack_publicize_connections' ) || [];
}

/**
 * Return True if Publicize Feature is enabled.
 * Otherwise, return False.
 *
 * @returns {boolean} Whether or not the publicize feature is enabled.
 */
export function getFeatureEnableState() {
	const { getEditedPostAttribute } = select( editorStore );
	const meta = getEditedPostAttribute( 'meta' );
	return get( meta, [ 'jetpack_publicize_feature_enabled' ], true );
}

/**
 * Get all Jetpack Social options.
 *
 * @returns {object} Object with Jetpack Social options.
 */
export function getJetpackSocialOptions() {
	const { getEditedPostAttribute } = select( editorStore );
	const meta = getEditedPostAttribute( 'meta' );
	return get( meta, [ 'jetpack_social_options' ], {} );
}

/**
 * Get whether the post has already been shared.
 *
 * @returns {object} Object with Jetpack Social options.
 */
export function getJetpackSocialPostAlreadyShared() {
	const { getEditedPostAttribute } = select( editorStore );
	const meta = getEditedPostAttribute( 'meta' );
	return get( meta, [ 'jetpack_social_post_already_shared' ], {} );
}

/**
 * Get a list of all attached media.
 *
 * @returns {Array<{id: string; url: string}>} An array of media IDs.
 */
export function getAttachedMedia() {
	return get( getJetpackSocialOptions(), [ 'attached_media' ], [] );
}

/**
 * Checks if the post is a social post.
 *
 * @returns {boolean} Whether the post is a social post.
 */
export function shouldUploadAttachedMedia() {
	return getJetpackSocialOptions()?.should_upload_attached_media ?? false;
}

/**
 * Get the image generator settings for a post.
 *
 * @returns {object} An object of image generator settings.
 */
export function getImageGeneratorPostSettings() {
	return getJetpackSocialOptions()?.image_generator_settings ?? {};
}

/**
 * Checks if the Instagram connection is supported.
 *
 * @returns {boolean} Whether the Instagram connection is supported
 */
export function isInstagramConnectionSupported() {
	return !! getJetpackData()?.social?.isInstagramConnectionSupported;
}

/**
 * Checks if the Mastodon connection is supported.
 *
 * @returns {boolean} Whether the Mastodon connection is supported
 */
export function isMastodonConnectionSupported() {
	return !! getJetpackData()?.social?.isMastodonConnectionSupported;
}
