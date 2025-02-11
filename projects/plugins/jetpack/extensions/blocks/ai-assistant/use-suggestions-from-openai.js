/**
 * External dependencies
 */
import { store as blockEditorStore } from '@wordpress/block-editor';
import { serialize } from '@wordpress/blocks';
import { useSelect, select as selectData, useDispatch } from '@wordpress/data';
import { useEffect, useState, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import debugFactory from 'debug';
import TurndownService from 'turndown';
/**
 * Internal dependencies
 */
import { DEFAULT_PROMPT_TONE } from './components/tone-dropdown-control';
import { buildPrompt } from './create-prompt';
import { askJetpack, askQuestion } from './get-suggestion-with-stream';

const debug = debugFactory( 'jetpack-ai-assistant' );

const turndownService = new TurndownService();

/**
 * Returns partial content from the beginning of the post
 * to the current block (clientId)
 *
 * @param {string} clientId - The current block clientId.
 * @returns {string}          The partial content.
 */
export function getPartialContentToBlock( clientId ) {
	if ( ! clientId ) {
		return '';
	}

	const editor = selectData( 'core/block-editor' );
	const index = editor.getBlockIndex( clientId );
	const blocks = editor.getBlocks().slice( 0, index ) ?? [];

	if ( ! blocks?.length ) {
		return '';
	}

	return turndownService.turndown( serialize( blocks ) );
}

/**
 * Returns content from all blocks,
 * by inspecting the blocks `content` attributes
 *
 * @returns {string} The content.
 */
export function getContentFromBlocks() {
	const editor = selectData( 'core/block-editor' );
	const blocks = editor.getBlocks();

	if ( ! blocks?.length ) {
		return '';
	}

	return turndownService.turndown( serialize( blocks ) );
}

const useSuggestionsFromOpenAI = ( {
	attributes,
	clientId,
	content,
	setError,
	tracks,
	userPrompt,
	onSuggestionDone,
	onUnclearPrompt,
	onModeration,
} ) => {
	const [ isLoadingCategories, setIsLoadingCategories ] = useState( false );
	const [ isLoadingCompletion, setIsLoadingCompletion ] = useState( false );
	const [ wasCompletionJustRequested, setWasCompletionJustRequested ] = useState( false );
	const [ showRetry, setShowRetry ] = useState( false );
	const [ lastPrompt, setLastPrompt ] = useState( '' );
	const { updateBlockAttributes } = useDispatch( blockEditorStore );
	const source = useRef();

	// Let's grab post data so that we can do something smart.
	const currentPostTitle = useSelect( select =>
		select( 'core/editor' ).getEditedPostAttribute( 'title' )
	);

	//TODO: decide if we still want to load categories and tags now user is providing the prompt by default.
	// If not the following can be removed.
	let loading = false;
	const categories =
		useSelect( select => select( 'core/editor' ).getEditedPostAttribute( 'categories' ) ) || [];

	const categoryObjects = useSelect(
		select => {
			return categories
				.map( categoryId => {
					const category = select( 'core' ).getEntityRecord( 'taxonomy', 'category', categoryId );

					if ( ! category ) {
						// Data is not yet loaded
						loading = true;
						return;
					}

					return category;
				} )
				.filter( Boolean ); // Remove undefined values
		},
		[ categories ]
	);

	const tags =
		useSelect( select => select( 'core/editor' ).getEditedPostAttribute( 'tags' ), [] ) || [];
	const tagObjects = useSelect(
		select => {
			return tags
				.map( tagId => {
					const tag = select( 'core' ).getEntityRecord( 'taxonomy', 'post_tag', tagId );

					if ( ! tag ) {
						// Data is not yet loaded
						loading = true;
						return;
					}

					return tag;
				} )
				.filter( Boolean ); // Remove undefined values
		},
		[ tags ]
	);

	useEffect( () => {
		setIsLoadingCategories( loading );
	}, [ loading ] );

	const postId = useSelect( select => select( 'core/editor' ).getCurrentPostId() );
	// eslint-disable-next-line no-unused-vars
	const categoryNames = categoryObjects
		.filter( cat => cat.id !== 1 )
		.map( ( { name } ) => name )
		.join( ', ' );
	// eslint-disable-next-line no-unused-vars
	const tagNames = tagObjects.map( ( { name } ) => name ).join( ', ' );

	const getStreamedSuggestionFromOpenAI = async ( type, options = {} ) => {
		options = {
			retryRequest: false,
			tone: DEFAULT_PROMPT_TONE,
			...options,
		};

		if ( isLoadingCompletion ) {
			return;
		}

		setShowRetry( false );
		setError( {} );

		let prompt = lastPrompt;

		if ( ! options.retryRequest ) {
			// If there is a content already, let's iterate over it.
			prompt = buildPrompt( {
				generatedContent: content,
				allPostContent: getContentFromBlocks(),
				postContentAbove: getPartialContentToBlock( clientId ),
				currentPostTitle,
				options,
				prompt,
				userPrompt,
				type,
				isGeneratingTitle: attributes.promptType === 'generateTitle',
			} );
		}

		tracks.recordEvent( 'jetpack_ai_chat_completion', {
			post_id: postId,
		} );

		if ( ! options.retryRequest ) {
			setLastPrompt( prompt );

			// If it is a title generation, keep the prompt type in subsequent changes.
			if ( attributes.promptType !== 'generateTitle' ) {
				updateBlockAttributes( clientId, { promptType: type } );
			}
		}

		try {
			setIsLoadingCompletion( true );
			setWasCompletionJustRequested( true );
			source.current = await askQuestion( prompt, postId );
		} catch ( err ) {
			if ( err.message ) {
				setError( { message: err.message, code: err?.code || 'unknown', status: 'error' } );
			} else {
				setError( {
					message: __(
						'Whoops, we have encountered an error. AI is like really, really hard and this is an experimental feature. Please try again later.',
						'jetpack'
					),
					code: 'unknown',
					status: 'error',
				} );
			}
			setShowRetry( true );
			setIsLoadingCompletion( false );
			setWasCompletionJustRequested( false );
		}

		source?.current?.addEventListener( 'done', e => {
			stopSuggestion();
			updateBlockAttributes( clientId, { content: e.detail } );
		} );

		source?.current?.addEventListener( 'error_unclear_prompt', () => {
			source?.current?.close();
			setIsLoadingCompletion( false );
			setWasCompletionJustRequested( false );
			setError( {
				code: 'error_unclear_prompt',
				message: __( 'Your request was unclear. Mind trying again?', 'jetpack' ),
				status: 'info',
			} );
			onUnclearPrompt?.();
		} );

		source?.current?.addEventListener( 'error_network', () => {
			source?.current?.close();
			setIsLoadingCompletion( false );
			setWasCompletionJustRequested( false );
			setShowRetry( true );
			setError( {
				code: 'error_network',
				message: __( 'It was not possible to process your request. Mind trying again?', 'jetpack' ),
				status: 'info',
			} );
		} );

		source?.current?.addEventListener( 'error_service_unavailable', () => {
			source?.current?.close();
			setIsLoadingCompletion( false );
			setWasCompletionJustRequested( false );
			setShowRetry( true );
			setError( {
				code: 'error_service_unavailable',
				message: __(
					'Jetpack AI services are currently unavailable. Sorry for the inconvenience.',
					'jetpack'
				),
				status: 'info',
			} );
		} );

		source?.current?.addEventListener( 'error_quota_exceeded', () => {
			source?.current?.close();
			setIsLoadingCompletion( false );
			setWasCompletionJustRequested( false );
			setShowRetry( false );
			setError( {
				code: 'error_quota_exceeded',
				message: __( 'You have reached the limit of requests for this site.', 'jetpack' ),
				status: 'info',
			} );
		} );

		source?.current?.addEventListener( 'error_moderation', () => {
			source?.current?.close();
			setIsLoadingCompletion( false );
			setWasCompletionJustRequested( false );
			setShowRetry( false );
			setError( {
				code: 'error_moderation',
				message: __(
					'This request has been flagged by our moderation system. Please try to rephrase it and try again.',
					'jetpack'
				),
				status: 'info',
			} );
			onModeration?.();
		} );

		source?.current?.addEventListener( 'suggestion', e => {
			setWasCompletionJustRequested( false );
			debug( 'fullMessage', e.detail );
			updateBlockAttributes( clientId, { content: e.detail } );
		} );
		return source?.current;
	};

	function stopSuggestion() {
		if ( ! source?.current ) {
			return;
		}

		source?.current?.close();
		setIsLoadingCompletion( false );
		setWasCompletionJustRequested( false );
		onSuggestionDone?.();
	}

	return {
		isLoadingCategories,
		isLoadingCompletion,
		wasCompletionJustRequested,
		setIsLoadingCategories,
		setShowRetry,
		showRetry,
		postTitle: currentPostTitle,
		contentBefore: getPartialContentToBlock( clientId ),
		wholeContent: getContentFromBlocks( clientId ),

		getSuggestionFromOpenAI: getStreamedSuggestionFromOpenAI,
		stopSuggestion,
		retryRequest: () => getStreamedSuggestionFromOpenAI( '', { retryRequest: true } ),
	};
};

export default useSuggestionsFromOpenAI;

/**
 * askJetpack is exposed just for debugging purposes
 */
window.askJetpack = askJetpack;
