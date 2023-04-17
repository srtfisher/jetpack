<script lang="ts">
	import { imageStore } from '../ApiMock';
	import TableRow from './TableRow.svelte';
</script>

<div class="jb-table">
	<div class="jb-table-header">
		<div class="jb-table-header__image">Image</div>
		<div class="jb-table-header__potential-size">Potential Size</div>
		<div class="jb-table-header__device">Device</div>
		<div class="jb-table-header__page">Page/Post</div>
	</div>
	{#each $imageStore as data}
		<TableRow {data} />
	{/each}
</div>

<style lang="scss">
	.jb-table-header {
		display: flex;
		gap: var( --gap );
		padding: var( --padding );
		background-color: #f2f2f2;
		border-bottom: 1px solid #ddd;

		justify-content: space-between;
	}

	.jb-table-header__image {
		width: var( --table-header-image );
	}
	.jb-table-header__device {
		width: var( --table-header-device );
	}
	.jb-table-header__potential-size {
		width: var( --table-header-potential-size );
	}
	.jb-table-header__page {
		flex-grow: 1;
	}
</style>
