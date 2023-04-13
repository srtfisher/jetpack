<script lang="ts">
	import { ImageMeta } from '../ApiMock';
	import TableRowExpanded from './TableRowExpanded.svelte';

	export let data: ImageMeta;
	let expanded = false;
</script>

<tr>
	<td>
		<div class="table-row">
			<img src={data.thumbnail} alt={data.title} width="50" height="50" />
			<div>
				<div>{data.title}</div>
				<div>{data.urlPreview}</div>
			</div>
		</div>
	</td>
	<td>
		<div>{data.originalSize} -> {data.optimizedSize}</div>
	</td>
	<td>
		<img src={data.deviceIcon} alt={data.deviceType} width="24" height="24" />
	</td>
	<td>
		<a href={data.pageLink}>{data.pageTitle}</a>
	</td>
	<td>
		<span class="chevron" on:click={() => ( expanded = ! expanded )}>{expanded ? '▲' : '▼'}</span>
	</td>
</tr>

{#if expanded}
	<TableRowExpanded {data} />
{/if}

<style lang="scss">
	.table-row {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr auto;
		align-items: center;
		gap: 1rem;
	}

	.chevron {
		cursor: pointer;
	}
</style>
