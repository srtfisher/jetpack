<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { quadOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import Button from '../../../elements/Button.svelte';
	import { ISA_Data } from '../store/isa-data';

	export let status: ISA_Data[ 'status' ];
	export let dimensions: ISA_Data[ 'image' ][ 'dimensions' ];
	export let edit_url: string;
	export let instructions: string;

	// Dispatch an event when the user clicks the "Ignore" button.
	const dispatch = createEventDispatcher();
</script>

<div class="table-row-expanded" transition:slide|local={{ duration: 100, easing: quadOut }}>
	<div class="image-details">
		<h4>Image Details</h4>

		<div class="row">
			<div class="label">File Dimensions</div>
			<div class="value">
				{Math.round( dimensions.file.width )}
				x
				{Math.round( dimensions.file.height )}
				px
			</div>
		</div>

		<div class="row">
			<div class="label">Expected Dimensions</div>
			<div class="value">
				{Math.round( dimensions.expected.width )}
				x
				{Math.round( dimensions.expected.height )}
				px
			</div>
		</div>

		<div class="row">
			<div class="label">Size on screen</div>
			<div class="value">
				{Math.round( dimensions.size_on_screen.width )}
				x
				{Math.round( dimensions.size_on_screen.height )}
				px
			</div>
		</div>
	</div>

	<div class="fix-options">
		<h4>How to fix</h4>
		<p>{instructions}</p>
		<div class="jb-actions">
			<Button width="auto" href={edit_url} fill>Fix on page</Button>
			<Button width="auto" on:click={() => dispatch( 'clickIgnore' )}>
				{#if status === 'ignored'}
					Don't Ignore
				{:else}
					Ignore
				{/if}
			</Button>
		</div>
	</div>
</div>

<style lang="scss">
	.table-row-expanded {
		display: flex;
		justify-content: space-between;
		padding: var( --gap );
		padding-left: calc( var( --thumbnail-size ) + var( --gap ) * 2 );
	}

	.image-details {
		flex: 1;
		max-width: 300px;
		display: flex;
		flex-direction: column;
		font-size: 0.875rem;
		gap: calc( var( --gap ) / 2 );
		h4 {
			font-weight: 600;
		}
		.row {
			display: flex;
			gap: 10px;
			justify-content: space-between;
		}
		.value {
			font-weight: 500;
		}
	}

	.jb-actions {
		display: flex;
		gap: var( --gap );
	}
	.fix-options {
		flex: 1;
		margin-left: calc( var( --table-header-potential-size ) - var( --gap ) * 2 );
	}
</style>
