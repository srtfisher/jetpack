<script lang="ts">
	import { ImageMeta } from '../ApiMock';

	export let data: ImageMeta;
</script>

<tr>
	<td colspan="5">
		<div class="table-row-expanded">
			<div class="image-details">
				<h4>Image Details</h4>
				<p>File dimensions: {data.fileDimensions}</p>
				<p>Expected dimensions: {data.expectedDimensions}</p>
				<p>Size on screen: {data.sizeOnScreen}</p>
			</div>
			<div class="fix-options">
				<h4>How to fix</h4>
				<p>{data.fixDescription}</p>
				<button>Fix on page</button>
				<button class="ignore-btn">Ignore</button>
			</div>
		</div>
	</td>
</tr>

<style lang="scss">
	.table-row-expanded {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		padding: 1rem;
	}

	.image-details {
		border-right: 1px solid #ddd;
	}

	.fix-options {
		text-align: right;
	}

	button {
		background-color: #4caf50;
		border: none;
		color: white;
		text-align: center;
		text-decoration: none;
		display: inline-block;
		font-size: 14px;

		margin: 4px 2px;
		cursor: pointer;
		border-radius: 4px;
		padding: 8px 16px;
	}

	.ignore-btn {
		background-color: #f44336;
	}
</style>
