/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { InspectorControls, RichText, BlockControls } from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { Panel, PanelBody, ToggleControl } from '@wordpress/components';
import { useContext, useEffect, useRef, useReducer } from '@wordpress/element';
import { useSelect, dispatch } from '@wordpress/data';
import { useDebounce } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import './editor.scss';
import { ParticipantsControl, ParticipantsRichControl } from './components/participants-control';
import { TimestampControl, TimestampDropdown } from './components/timestamp-control';
import { BASE_CLASS_NAME } from './utils';
import ConversationContext from '../conversation/components/context';
import { list as defaultParticipants } from '../conversation/participants.json';
import { STORE_ID as MEDIA_SOURCE_STORE_ID } from '../../store/media-source/constants';
import { MediaPlayerToolbarControl } from '../../shared/components/media-player-control';
import { convertSecondsToTimeCode } from '../../shared/components/media-player-control/utils';
import { getParticipantBySlug } from '../conversation/utils';

const blockName = 'jetpack/dialogue';
const blockNameFallback = 'core/paragraph';

const speakersControlReducer = state => state + 1;

export default function DialogueEdit( {
	className,
	attributes,
	setAttributes,
	context,
	onReplace,
	mergeBlocks,
	isSelected,
} ) {
	const {
		content,
		participantLabel,
		participantValue,
		participantSlug,
		placeholder,
		showTimestamp,
		timestamp,
	} = attributes;

	const mediaSource = useSelect( select => (
		select( MEDIA_SOURCE_STORE_ID ).getDefaultMediaSource()
	), [] );

	// we use a reducer to force re-rendering the ParticipantsRichControl,
	// passing the `reRenderingKey` as property of the component.
	// It's required when we want to update the options in the autocomplete,
	// or when we need to hide it.
	const [ reRenderingKey, triggerRefreshAutocomplete ] = useReducer( speakersControlReducer, 0 );

	const contentRef = useRef();

	// Block context integration.
	const participantsFromContext = context[ 'jetpack/conversation-participants' ];
	const showConversationTimestamps = context[ 'jetpack/conversation-showTimestamps' ];

	// Participants list.
	const participants = participantsFromContext?.length
		? participantsFromContext
		: defaultParticipants;

	const conversationParticipant = getParticipantBySlug( participants, participantSlug );

	// Conversation context. A bridge between dialogue and conversation blocks.
	const conversationBridge = useContext( ConversationContext );

	const debounceSetDialoguesAttrs = useDebounce( setAttributes, 100 );

	// Update dialogue participant with conversation participant changes.
	useEffect( () => {
		if ( ! conversationParticipant ) {
			return;
		}

		if ( conversationParticipant.slug !== participantSlug ) {
			return;
		}

		// Do not update current Dialogue block.
		if ( isSelected ) {
			return;
		}

		debounceSetDialoguesAttrs( {
			participantLabel: conversationParticipant.label,
			participantValue: conversationParticipant.value,
		} );
	}, [ conversationParticipant, debounceSetDialoguesAttrs, isSelected, participantSlug ] );

	// Update dialogue timestamp setting from parent conversation.
	useEffect( () => {
		setAttributes( { showTimestamp: showConversationTimestamps } );
	}, [ showConversationTimestamps, setAttributes ] );

	function setShowConversationTimestamps( value ) {
		conversationBridge.setAttributes( { showTimestamps: value } );
	}

	function setTimestamp( time ) {
		setAttributes( { timestamp: time } );
	}

	return (
		<div className={ className }>
			<BlockControls>
				{ mediaSource && (
					<MediaPlayerToolbarControl
						onTimeChange={ time => setTimestamp( convertSecondsToTimeCode( time ) ) }
					/>
				) }
			</BlockControls>

			<InspectorControls>
				<Panel>
					<PanelBody title={ __( 'Participant', 'jetpack' ) }>
						<ParticipantsControl
							className={ BASE_CLASS_NAME }
							participants={ participants }
							participantSlug={ participantSlug || '' }
							onSelect={ setAttributes }
						/>
					</PanelBody>

					{ !! mediaSource?.title && (
						<PanelBody title={ __( 'Podcast episode', 'jetpack' ) }>
							<p>{ mediaSource.title }</p>
						</PanelBody>
					) }

					<PanelBody title={ __( 'Timestamp', 'jetpack' ) }>
						<ToggleControl
							label={ __( 'Show conversation timestamps', 'jetpack' ) }
							checked={ showTimestamp }
							onChange={ setShowConversationTimestamps }
						/>

						{ showTimestamp && (
							<TimestampControl
								className={ BASE_CLASS_NAME }
								value={ timestamp }
								onChange={ setTimestamp }
							/>
						) }
					</PanelBody>
				</Panel>
			</InspectorControls>

			<div className={ `${ BASE_CLASS_NAME }__meta` }>
				<ParticipantsRichControl
					className={ `${ BASE_CLASS_NAME }__participant` }
					label={ participantLabel }
					value={ participantValue }
					participant={ conversationParticipant }
					participants={ participants }
					reRenderingKey={ `re-render-key${ reRenderingKey }` }
					onParticipantChange={ ( updatedParticipant ) => {
						setAttributes( { participantValue: updatedParticipant } );
					} }

					onSelect={ ( { slug, label, value } ) => {
						// let's focus to content when it's possible.
						contentRef?.current?.focus();

						setAttributes( {
							participantLabel: label,
							participantValue: value,
							participantSlug: slug,
						} );
					} }

					onClean = { () => {
						setAttributes( { participantSlug: null } );
					} }

					onAdd={ ( newValue ) => {
						// let's focus to content when it's possible.
						contentRef?.current?.focus();
						triggerRefreshAutocomplete();

						if ( ! newValue?.length ) {
							return;
						}

						const newParticipant = conversationBridge.addNewParticipant( newValue );
						if ( ! newParticipant ) {
							return;
						}

						setAttributes( {
							participantValue: newParticipant.value,
							participantLabel: newParticipant.label,
							participantSlug: newParticipant.slug,
						} );
					} }

					onUpdate={ conversationBridge.updateParticipants }
				/>

				{ showTimestamp && (
					<TimestampDropdown
						className={ BASE_CLASS_NAME }
						value={ timestamp }
						onChange={ setTimestamp }
						shortLabel={ true }
					/>
				) }
			</div>

			<RichText
				ref={ contentRef }
				identifier="content"
				tagName="p"
				className={ `${ BASE_CLASS_NAME }__content` }
				value={ content }
				onChange={ value => setAttributes( { content: value } ) }
				onMerge={ mergeBlocks }
				onSplit={ value => {
					if ( ! content?.length ) {
						return createBlock( blockNameFallback );
					}

					return createBlock( blockName, {
						...attributes,
						content: value,
					} );
				} }
				onReplace={ ( blocks, ...args ) => {
					// If transcription bridge doesn't exist,
					// then run the default replace process.
					if ( ! conversationBridge ) {
						return onReplace( blocks, ...args );
					}

					// Detect if the block content is empty.
					// If so, keep only one paragraph block,
					// in order to avoid duplicated blocks.
					if (
						blocks[ 0 ]?.name === blockNameFallback &&
						blocks[ 1 ]?.name === blockNameFallback &&
						! blocks[ 0 ]?.attributes.content &&
						! blocks[ 1 ]?.attributes.content
					) {
						dispatch( 'core/block-editor' ).selectBlock( blocks[ 0 ].clientId );
						return onReplace( [ blocks[ 0 ] ], ...args );
					}

					// Update new block attributes.
					blocks[ 1 ].attributes = {
						timestamp: attributes.timestamp, // <- keep same timestamp value.
					};

					onReplace( blocks, ...args );
				} }
				onRemove={ onReplace ? () => onReplace( [] ) : undefined }
				placeholder={ placeholder || __( 'Write dialogue…', 'jetpack' ) }
				keepPlaceholderOnFocus={ true }
				onFocus={ () => {
					// Provably, we should add a new participant from here.
					// onFocusOutside is not supported by some Gutenberg versions.
					// Take a look at <ParticipantsRichControl /> to get more info.
					// addNewParticipant will take over to add, or not, the participant.
					const { value, label, slug } = conversationBridge.addNewParticipant( participantValue );
					setAttributes( {
						participantValue: value,
						participantLabel: label,
						participantSlug: slug,
					} );

					triggerRefreshAutocomplete();
				} }
			/>
		</div>
	);
}
