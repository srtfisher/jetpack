/**
 * External dependencies
 */
import {
	Icon,
	warning,
	info,
	cancelCircleFilled as error,
	check as success,
} from '@wordpress/icons';
/**
 * Types
 */
import type React from 'react';

import './style.scss';

const messageTypes = [ 'warning', 'error', 'success', 'info' ] as const;

export type MessageProps = {
	icon?: React.ReactNode;
	children: React.ReactNode;
	type: ( typeof messageTypes )[ number ];
};

const messageIconsMap = {
	[ messageTypes[ 0 ] ]: warning,
	[ messageTypes[ 1 ] ]: error,
	[ messageTypes[ 2 ] ]: success,
	[ messageTypes[ 3 ] ]: info,
};

/**
 * React component to render a block message.
 *
 * @param {MessageProps} props - Component props.
 * @returns {React.ReactElement }    Banner component.
 */
export default function Message( {
	type,
	icon = warning,
	children,
}: MessageProps ): React.ReactElement {
	return (
		<div className="jetpack-ai-assistant__message">
			<Icon icon={ messageIconsMap[ type ] || icon } />
			<div className="jetpack-ai-assistant__message-content">{ children }</div>
		</div>
	);
}
