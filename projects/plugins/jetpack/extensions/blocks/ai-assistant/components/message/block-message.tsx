/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import Message, { MESSAGE_SEVERITY_INFO, MESSAGE_SEVERITY_SUCCESS } from '.';
import './style.scss';
/**
 * Types
 */
import type { MessageSeverityProp, MessageProps } from '.';
import type React from 'react';

export const ASSISTANT_STATE_INIT = 'init';
export const ASSISTANT_STATE_READY_TO_GENERATE = 'ready-to-generate';
export const ASSISTANT_STATE_GENERATING = 'generating-content';
export const ASSISTANT_STATE_CONTENT_GENERATED = 'content-generated';

const blockStateTypes = [
	ASSISTANT_STATE_INIT,
	ASSISTANT_STATE_READY_TO_GENERATE,
	ASSISTANT_STATE_GENERATING,
	ASSISTANT_STATE_CONTENT_GENERATED,
] as const;

export type BlockMessageProps = MessageProps & {
	state: ( typeof blockStateTypes )[ number ];
};

/**
 * React component to render a block message.
 *
 * @param {BlockMessageProps} props - Component props.
 * @returns {React.ReactElement }    Banner component.
 */
export default function BlockMessage( props: BlockMessageProps ): React.ReactElement {
	const { state } = props;
	if ( ! state ) {
		return null;
	}

	// Ready to generate message
	let messageText = null;
	let severity: MessageSeverityProp = MESSAGE_SEVERITY_INFO;

	switch ( state ) {
		case ASSISTANT_STATE_INIT:
			messageText = __( 'Ask for content suggestions.', 'jetpack' ); // 'Ask for content suggestions.
			break;

		case ASSISTANT_STATE_READY_TO_GENERATE:
			messageText = __( 'Press Enter to send your request.', 'jetpack' );
			break;

		case ASSISTANT_STATE_GENERATING:
			messageText = __( 'Generating content… Click on the Stop button to cancel.', 'jetpack' );
			break;

		case ASSISTANT_STATE_CONTENT_GENERATED:
			messageText = __( 'Done. Click on the Accept button to insert the content.', 'jetpack' );
			severity = MESSAGE_SEVERITY_SUCCESS;
			break;
	}

	return (
		<Message { ...props } severity={ severity }>
			{ messageText }
		</Message>
	);
}
