<script lang="ts">
	import Button from '../../../elements/Button.svelte';
</script>

<div class="hover">
	<p>Resize this image to match the size of the screen</p>

	<div class="button-container">
		<Button>Edit Image</Button>
	</div>
</div>

<style lang="scss">
	.hover {
		display: flex;
	}
	p {
		flex-grow: 1;
	}
</style>
