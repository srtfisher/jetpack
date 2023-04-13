import { writable } from 'svelte/store';

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

export interface ImageMeta {
	thumbnail: string;
	title: string;
	urlPreview: string;
	originalSize: string;
	optimizedSize: string;
	deviceIcon: string;
	deviceType: string;
	pageLink: string;
	pageTitle: string;
	fileDimensions: string;
	expectedDimensions: string;
	sizeOnScreen: string;
	fixDescription: string;
}

export const imageData: ImageMeta[] = [
	{
		thumbnail: 'https://via.placeholder.com/50',
		title: 'Sample Image 1',
		urlPreview: 'example.com/home',
		originalSize: '2.5MB',
		optimizedSize: '0.5MB',
		deviceIcon: 'https://via.placeholder.com/24',
		deviceType: 'desktop',
		pageLink: 'https://example.com/home',
		pageTitle: 'Home',
		fileDimensions: '1920x1080',
		expectedDimensions: '1280x720',
		sizeOnScreen: '25%',
		fixDescription: 'Resize the image to the expected dimensions and compress it.',
	},
	{
		thumbnail: 'https://via.placeholder.com/50',
		title: 'Sample Image 2',
		urlPreview: 'example.com/about',
		originalSize: '1.2MB',
		optimizedSize: '0.3MB',
		deviceIcon: 'https://via.placeholder.com/24',
		deviceType: 'phone',
		pageLink: 'https://example.com/about',
		pageTitle: 'About Us',
		fileDimensions: '800x600',
		expectedDimensions: '400x300',
		sizeOnScreen: '50%',
		fixDescription: 'Resize the image to the expected dimensions and compress it.',
	},
	{
		thumbnail: 'https://via.placeholder.com/50',
		title: 'Sample Image 3',
		urlPreview: 'example.com/contact',
		originalSize: '3.0MB',
		optimizedSize: '0.8MB',
		deviceIcon: 'https://via.placeholder.com/24',
		deviceType: 'desktop',
		pageLink: 'https://example.com/contact',
		pageTitle: 'Contact',
		fileDimensions: '2560x1440',
		expectedDimensions: '1920x1080',
		sizeOnScreen: '30%',
		fixDescription: 'Resize the image to the expected dimensions and compress it.',
	},
];
