import { readable, writable } from 'svelte/store';

type CategoryState = {
	name: string;
	progress: number;
	issues?: number;
	done: boolean;
};

export const categories = writable< CategoryState[] >( [
	{
		name: 'Homepage',
		progress: 100,
		issues: 2,
		done: true,
	},
	{
		name: 'Pages',
		progress: 100,
		issues: 0,
		done: true,
	},
	{
		name: 'Posts',
		progress: 37,
		issues: 4,
		done: false,
	},
	{
		name: 'Other',
		progress: 0,
		// issues: 0, leaving intentionally undefined
		done: false,
	},
] );
export type Dimensions = { width: number; height: number };
export type ImageMeta = {
	thumbnail: string;
	image: {
		url: string;
		dimensions: {
			file: Dimensions;
			expected: Dimensions;
			size_on_screen: Dimensions;
		},
		weight: {
			current: number;
			potential: number;
		}
	},
	page: {
		id: number;
		url: string;
		title: string;
	};
	device_type: 'phone' | 'desktop';

	instructions: string;
}

const sampleData: ImageMeta[] = [
	{
		thumbnail: 'https://placekitten.com/50',
		image: {
			url: 'https://placekitten.com/1920/1080',
			dimensions: {
				file: {
					width: 1920,
					height: 1080,
				},
				expected: {
					width: 1280,
					height: 720,
				},
				size_on_screen: {
					width: 25,
					height: 25,
				},
			},
			weight: {
				current: 2500,
				potential: 500,
			},
		},
		page: {
			id: 1,
			url: 'example.com/home',
			title: 'Home',
		},
		device_type: 'desktop',
		instructions: 'Resize the image to the expected dimensions and compress it.',
	},
	{
		thumbnail: 'https://placekitten.com/50',
		image: {
			url: 'https://placekitten.com/800/600',
			dimensions: {
				file: {
					width: 800,
					height: 600,
				},
				expected: {
					width: 400,
					height: 300,
				},
				size_on_screen: {
					width: 50,
					height: 50,
				},
			},
			weight: {
				current: 1200,
				potential: 300,
			},
		},
		page: {
			id: 2,
			url: 'example.com/about',
			title: 'About Us',
		},
		device_type: 'phone',
		instructions: 'Resize the image to the expected dimensions and compress it.',
	},
	{
		thumbnail: 'https://placekitten.com/50',
		image: {
			url: 'https://placekitten.com/2560/1440',
			dimensions: {
				file: {
					width: 2560,
					height: 1440,
				},
				expected: {
					width: 1920,
					height: 1080,
				},
				size_on_screen: {
					width: 30,
					height: 30,
				},
			},
			weight: {
				current: 3000,
				potential: 800,
			},
		},
		page: {
			id: 3,
			url: 'example.com/contact',
			title: 'Contact',
		},
		device_type: 'desktop',
		instructions: 'Resize the image to the expected dimensions and compress it.',
	},
];

export const imageStore = readable<ImageMeta[]>( sampleData, () => () => {} );
