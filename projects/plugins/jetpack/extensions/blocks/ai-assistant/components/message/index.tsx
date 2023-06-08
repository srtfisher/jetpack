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
 * SeverityTypes
 */
import type React from 'react';

import './style.scss';

const messageSeverityTypes = [ 'warning', 'error', 'success', 'info' ] as const;

export type MessageProps = {
	icon?: React.ReactNode;
	children: React.ReactNode;
	severity: ( typeof messageSeverityTypes )[ number ];
};

const messageIconsMap = {
	[ messageSeverityTypes[ 0 ] ]: warning,
	[ messageSeverityTypes[ 1 ] ]: error,
	[ messageSeverityTypes[ 2 ] ]: success,
	[ messageSeverityTypes[ 3 ] ]: info,
};

/**
 * React component to render a block message.
 *
 * @param {MessageProps} props - Component props.
 * @returns {React.ReactElement }    Banner component.
 */
export default function Message( {
	severity,
	icon = warning,
	children,
}: MessageProps ): React.ReactElement {
	return (
		<div className="jetpack-ai-assistant__message">
			<Icon icon={ messageIconsMap[ severity ] || icon } />
			<div className="jetpack-ai-assistant__message-content">{ children }</div>
		</div>
	);
}
