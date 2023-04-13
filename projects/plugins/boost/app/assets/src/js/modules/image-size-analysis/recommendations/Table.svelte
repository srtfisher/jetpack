<script lang="ts">
	import { imageData } from '../ApiMock';
	import TableRow from './TableRow.svelte';
</script>

<table class="table">
	<thead>
		<tr>
			<th>Image</th>
			<th>Potential Size</th>
			<th>Device</th>
			<th>Page/Post</th>
			<th />
		</tr>
	</thead>
	<tbody>
		{#each imageData as data}
			<TableRow {data} />
		{/each}
	</tbody>
</table>

<style lang="scss">
	.table {
		border-collapse: collapse;
		width: 100%;
	}

	th {
		background-color: #f2f2f2;
		text-align: left;
		padding: 8px;
	}

	td {
		border: 1px solid #ddd;
		padding: 8px;
	}
</style>
