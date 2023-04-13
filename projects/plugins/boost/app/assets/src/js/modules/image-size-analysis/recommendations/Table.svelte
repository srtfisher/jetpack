<script lang="ts">
	import { imageData } from '../ApiMock';
	import TableRow from './TableRow.svelte';
</script>

<div class="table">
	<div class="table-header">
		<div class="table-cell">Image</div>
		<div class="table-cell">Potential Size</div>
		<div class="table-cell">Device</div>
		<div class="table-cell">Page/Post</div>
		<div class="table-cell" />
	</div>
	{#each imageData as data}
		<TableRow {data} />
	{/each}
</div>

<style lang="scss">
	.table {
		display: grid;
		grid-template-columns: 1fr;
	}

	.table-header {
		display: grid;
		grid-template-columns: 64px 7fr 1fr 3fr 1fr;
		background-color: #f2f2f2;
		border-bottom: 1px solid #ddd;
	}

	.table-cell {
		padding: 8px;
		text-align: left;
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
