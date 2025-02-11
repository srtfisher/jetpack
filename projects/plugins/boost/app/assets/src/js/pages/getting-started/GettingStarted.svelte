<script lang="ts">
	import { onMount } from 'svelte';
	import { derived, get, writable } from 'svelte/store';
	import { Snackbar } from '@wordpress/components';
	import ActivateLicense from '../../elements/ActivateLicense.svelte';
	import ReactComponent from '../../elements/ReactComponent.svelte';
	import { BoostPricingTable } from '../../react-components/BoostPricingTable';
	import Header from '../../sections/Header.svelte';
	import config, { markGetStartedComplete } from '../../stores/config';
	import { connection } from '../../stores/connection';
	import { modulesState, modulesStatePending } from '../../stores/modules';
	import { recordBoostEvent } from '../../utils/analytics';
	import { getUpgradeURL } from '../../utils/upgrade';

	$: pricing = $config.pricing;

	// svelte-ignore unused-export-let - Ignored values supplied by svelte-navigator.
	export let navigate, location;

	let initiatingFreePlan = false;
	let initiatingPaidPlan = false;
	const dismissedSnackbar = writable( false );

	const snackbarMessage = derived(
		[ connection, dismissedSnackbar ],
		( [ $connection, $dismissedSnackbar ] ) => {
			if ( ! $dismissedSnackbar && ! $connection.connected && $connection.error?.message ) {
				return $connection.error.message;
			}

			return null;
		}
	);

	const ensureConnection = async () => {
		let connectionStore;
		connection.subscribe( value => {
			connectionStore = value;
		} );

		if ( connectionStore.connected ) {
			return;
		}

		await connection.initialize();

		if ( ! connectionStore.connected ) {
			throw connectionStore.error;
		}
	};

	const chooseFreePlan = async () => {
		initiatingFreePlan = true;

		await Promise.all( [
			recordBoostEvent( 'free_cta_from_getting_started_page_in_plugin', {} ),
			await ( async () => {
				try {
					await ensureConnection();

					// Allow opening the boost settings page. The actual flag is changed in the backend by enabling the critical-css module below.
					markGetStartedComplete();

					// Wait for the module to become active.
					// Otherwise Critical CSS Generation will fail to start.
					$modulesState.critical_css.active = true;
					const unsubscribe = modulesStatePending.subscribe( isPending => {
						if ( isPending === false ) {
							unsubscribe();
							navigate( '/' );
						}
					} );
				} catch ( e ) {
					dismissedSnackbar.set( false );
				} finally {
					initiatingFreePlan = false;
				}
			} )(),
		] );
	};

	const choosePaidPlan = async () => {
		initiatingPaidPlan = true;

		await Promise.all( [
			await recordBoostEvent( 'premium_cta_from_getting_started_page_in_plugin', {} ),
			await ( async () => {
				try {
					await ensureConnection();

					// Check if the site is already on a premium plan and go directly to settings if so.
					if ( get( config ).isPremium ) {
						// Allow opening the boost settings page.
						markGetStartedComplete();

						navigate( '/', { replace: true } );
						return;
					}

					window.location.href = getUpgradeURL();
				} catch ( e ) {
					dismissedSnackbar.set( false );
				} finally {
					initiatingPaidPlan = false;
				}
			} )(),
		] );
	};

	onMount( () => {
		// If we don't have pricing data, we should skip the page and go directly to settings.
		if ( typeof pricing.yearly === 'undefined' ) {
			// Allow opening the boost settings page.
			markGetStartedComplete();

			navigate( '/', { replace: true } );
		}
	} );
</script>

<div id="jb-dashboard" class="jb-dashboard jb-dashboard--main">
	<Header>
		<ActivateLicense />
	</Header>

	{#if pricing.yearly}
		<div class="jb-section jb-section--alt">
			<div class="jb-container">
				<div class="jb-pricing-table">
					<ReactComponent
						this={BoostPricingTable}
						{pricing}
						onPremiumCTA={choosePaidPlan}
						onFreeCTA={chooseFreePlan}
						chosenFreePlan={initiatingFreePlan}
						chosenPaidPlan={initiatingPaidPlan}
					/>
					{#if $snackbarMessage}
						<ReactComponent
							this={Snackbar}
							children={$snackbarMessage}
							onDismiss={() => dismissedSnackbar.set( true )}
						/>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.jb-pricing-table {
		isolation: isolate;
	}
</style>
