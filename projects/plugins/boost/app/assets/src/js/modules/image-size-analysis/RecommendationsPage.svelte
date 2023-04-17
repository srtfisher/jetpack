<script lang="ts">
	import Header from './recommendations/Header.svelte';
	import Pagination from './recommendations/Pagination.svelte';
	import Table from './recommendations/Table.svelte';
</script>

<div class="recommendations-page jb-container">
	<Header />
	<Table />
	<Pagination />
</div>

<style lang="scss">
	.recommendations-page {
		display: grid;
		gap: 1rem;

		// Table
		--gap: 16px;
		--padding: 16px;
		--border-radius: 4px;

		--thumbnail-size: 65px;
		--border: 1px solid #ddd;

		// Table Columns: Headers
		--table-header-image: calc( 40% + var( --thumbnail-size ) + var( --gap ) );
		--table-header-device: 65px;
		--table-header-potential-size: 20%;

		// Table Columns: Content
		--table-column-device: var( --table-header-device );
		--table-column-expand: 65px;
		--table-column-title: 40%;
		--table-column-potential-size: 20%;

		line-height: 1.5;
		-webkit-font-smoothing: antialiased;
	}
</style>
