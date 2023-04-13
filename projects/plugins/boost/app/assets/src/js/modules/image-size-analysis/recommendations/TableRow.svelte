<script lang="ts">
	import { ImageMeta } from '../ApiMock';
	import TableRowExpanded from './TableRowExpanded.svelte';

	export let data: ImageMeta;
	let expanded = false;
</script>

<div class="table-row">
	<div class="thumbnail">
		<img src={data.thumbnail} alt={data.title} width="64" height="64" />
	</div>
	<div class="title">
		<div>{data.title}</div>
		<div>{data.urlPreview}</div>
	</div>
	<div class="device">
		<img src={data.deviceIcon} alt={data.deviceType} />
	</div>
	<div class="page">
		<a href={data.pageLink}>{data.pageTitle}</a>
	</div>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="chevron" on:click={() => ( expanded = ! expanded )}>
		<span>{expanded ? '▲' : '▼'}</span>
	</div>
</div>

{#if expanded}
	<TableRowExpanded {data} />
{/if}

<style lang="scss">
	.table-row {
		display: grid;
		width: 100%;
		grid-template-columns: 64px 7fr 1fr 3fr 1fr;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.table-row > div:nth-child( 2 ) {
		display: flex;
		flex-direction: column;
	}

	.chevron {
		cursor: pointer;
		text-align: right;
	}

	@media ( max-width: 768px ) {
		.table-row {
			grid-template-columns: 64px 1fr auto;
		}

		.device,
		.page {
			display: none;
		}
	}
</style>
