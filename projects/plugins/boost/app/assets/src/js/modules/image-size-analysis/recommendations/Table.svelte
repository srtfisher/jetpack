<script lang="ts">
	import { imageStore } from '../ApiMock';
	import TableRow from './TableRow.svelte';
</script>

<div class="table">
	<div class="table-header">
		<div class="jb-column-image">Image</div>
		<div class="jb-column-potential-size">Potential Size</div>
		<div class="jb-column-device">Device</div>
		<div class="jb-column-page">Page/Post</div>
	</div>
	{#each $imageStore as data}
		<TableRow {data} />
	{/each}
</div>

<style lang="scss">
	.table-header {
		display: flex;
		gap: 10px;
		padding: 10px;
		background-color: #f2f2f2;
		border-bottom: 1px solid #ddd;

		justify-content: space-between;
	}

	.jb-column-image {
		width: 40%;
	}
	.jb-column-device {
		width: 64px;
	}
	.jb-column-potential-size {
		width: 20%;
	}
	.jb-column-page {
		flex-grow: 1;
	}

	@media ( max-width: 768px ) {
		.table-header {
			grid-template-columns: auto 1fr auto;
		}

		.table-cell:nth-child( 3 ),
		.table-cell:nth-child( 4 ) {
			display: none;
		}
	}
</style>
