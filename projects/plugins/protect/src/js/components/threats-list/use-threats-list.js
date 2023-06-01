import {
	plugins as pluginsIcon,
	wordpress as coreIcon,
	color as themesIcon,
	code as filesIcon,
	grid as databaseIcon,
} from '@wordpress/icons';
import { useMemo, useState } from 'react';
import useProtectData from '../../hooks/use-protect-data';

const sortThreats = ( a, b ) => b.severity - a.severity;

/**
 * Flatten threats data
 *
 * Merges threat category data with each threat it contains, plus any additional data provided.
 *
 * @param {object} data    - The threat category data, i.e. "core", "plugins", "themes", etc.
 * @param {object} newData - Additional data to add to each threat.
 * @returns {object[]} Array of threats with additional properties from the threat category and function argument.
 */
const flattenThreats = ( data, newData ) => {
	// If "data" has multiple entries, recursively flatten each one.
	if ( Array.isArray( data ) ) {
		return data.map( extension => flattenThreats( extension, newData ) ).flat();
	}

	// Merge the threat category data with each threat it contains, plus any additional data provided.
	return data?.threats.map( threat => ( {
		...threat,
		...data,
		...newData,
	} ) );
};

/**
 * Threats List Hook
 *
 * @typedef {object} UseThreatsList
 * @property {object}   item        - The selected threat category.
 * @property {object[]} list        - The list of threats to display.
 * @property {string}   selected    - The selected threat category.
 * @property {Function} setSelected - Sets the selected threat category.
 * ---
 * @returns {UseThreatsList} useThreatsList hook.
 */
const useThreatsList = () => {
	const { plugins, themes, core, files, database } = useProtectData();

	const [ selected, setSelected ] = useState( 'all' );

	const { unsortedList, item } = useMemo( () => {
		// If a specific threat category is selected, filter for and flatten the category's threats.
		if ( selected && selected !== 'all' ) {
			// Core, files, and database data threats are already grouped together,
			// so we just need to flatten them and add the appropriate icon.
			switch ( selected ) {
				case 'wordpress':
					return {
						list: flattenThreats( core, { icon: coreIcon } ),
						item: core,
					};
				case 'files':
					return {
						list: flattenThreats( files, { icon: filesIcon } ),
						item: files,
					};
				case 'database':
					return {
						list: flattenThreats( database, { icon: databaseIcon } ),
						item: database,
					};
				default:
					break;
			}

			// Extensions (i.e. plugins and themes) have entries for each individual extension,
			// so we need to check for a matching threat in each extension.
			const pluginsItem = plugins.find( threat => threat?.name === selected );
			if ( pluginsItem ) {
				return {
					list: flattenThreats( pluginsItem, pluginsIcon ),
					item: pluginsItem,
				};
			}
			const themesItem = themes.find( threat => threat?.name === selected );
			if ( themesItem ) {
				return {
					list: flattenThreats( themesItem, themesIcon ),
					item: themesItem,
				};
			}
		}

		// Otherwise, return all threats.
		return {
			list: [
				...flattenThreats( core, coreIcon ),
				...flattenThreats( plugins, pluginsIcon ),
				...flattenThreats( themes, themesIcon ),
				...flattenThreats( files, filesIcon ),
				...flattenThreats( database, databaseIcon ),
			],
			item: null,
		};
	}, [ core, database, files, plugins, selected, themes ] );

	const list = useMemo( () => {
		return unsortedList.sort( sortThreats );
	}, [ unsortedList ] );

	return {
		item,
		list,
		selected,
		setSelected,
	};
};

export default useThreatsList;
