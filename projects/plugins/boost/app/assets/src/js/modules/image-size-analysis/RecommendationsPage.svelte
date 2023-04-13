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
	}
</style>
