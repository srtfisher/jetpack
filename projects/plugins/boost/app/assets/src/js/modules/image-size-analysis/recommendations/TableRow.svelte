<script lang="ts">
	import { ImageMeta } from '../ApiMock';
	import TableRowExpanded from './TableRowExpanded.svelte';
	import TableRowHover from './TableRowHover.svelte';
	import Pill from './components/Pill.svelte';

	export let data: ImageMeta;
	let expanded = false;
	let hover = Math.random() > 0.5;
	const title = data.image.url.split( '/' ).pop();
</script>

<div
	class="table-row"
	on:mouseenter={() => ( hover = true )}
	on:mouseleave={() => ( hover = false )}
>
	<div class="jb-column-thumbnail">
		<img src={data.thumbnail} alt={title} width="64" height="64" />
	</div>

	<div class="jb-column-title">
		<div><b>{title}</b></div>
		<div>{data.page.url}</div>
	</div>

	<div class="jb-column-potential-size">
		<Pill color="#facfd2">
			{Math.round( data.image.weight.current )} KB
		</Pill>
		<div class="jb-arrow">→</div>
		<Pill color="#d0e6b8">
			{Math.round( data.image.weight.potential )} KB
		</Pill>
	</div>

	<div class="jb-column-hover">
		<TableRowHover />
	</div>

	<div class="jb-column-device">
		{#if data.device_type === 'phone'}
			📱
		{:else}
			💻
		{/if}
	</div>

	<div class="jb-column-page">
		<a href={data.page.url}>{data.page.title}</a>
	</div>

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="jb-column-arrow" on:click={() => ( expanded = ! expanded )}>
		<span>{expanded ? '▲' : '▼'}</span>
	</div>
</div>

{#if expanded}
	<TableRowExpanded {data} />
{/if}

<style lang="scss">
	.table-row {
		display: flex;
		align-items: center;
		height: 150px;
		gap: 10px;
		padding: 10px;

		.jb-column-hover {
			display: none;
		}
		&:hover {
			.jb-column-hover {
				display: block;
			}
			.jb-column-device,
			.jb-column-page {
				display: none;
			}
		}

		// div {
		// 	border: 1px solid gray;
		// }
	}
	.jb-column-thumbnail {
		width: 64px;
		img {
			display: block;
		}
	}
	.jb-column-title {
		// header - thumbnail - gap
		min-width: calc( 40% - 64px - 10px );
		margin-right: auto;
	}
	.jb-column-hover {
		width: 40%;
	}
	.jb-column-potential-size {
		width: 20%;

		display: flex;
		align-items: center;
		gap: 10px;
	}
	.jb-column-device {
		width: 64px;
		text-align: center;
	}
	.jb-column-page {
		flex-grow: 1;
	}
	.jb-column-arrow {
		cursor: pointer;
		text-align: right;
		width: 64px;
	}

	.jb-column-hover {
		// width: calc( 20% + 100px + 64px - 40px );
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

	.potential-size {
		display: flex;
	}
</style>
