import { SVG, Path, G } from '@wordpress/components';

/**
 * Blaze Fire Icon.
 *
 * @returns {Element} Icon component.
 */
export default function BlazeIcon() {
	return (
		<SVG width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<G clipPath="url(#clip0_4728_49296)">
				<circle cx="12" cy="12" r="12" fill="#D9D9D9" />
				<circle cx="12" cy="12" r="12" fill="black" />
				<Path
					d="M14.8665 6.68544C14.7139 6.50468 14.4652 6.43826 14.2436 6.52015C14.0224 6.60204 13.875 6.81412 13.875 7.05149V8.71684C13.875 9.02893 13.6226 9.2829 13.3125 9.2829C13.0024 9.2829 12.75 9.02893 12.75 8.71684V4.72989C12.75 4.56762 12.681 4.41365 12.5602 4.3061C12.4354 4.19515 12.3622 4.13288 12.3622 4.13288C12.1537 3.95627 11.8485 3.95552 11.6389 4.13175C11.4086 4.32572 6 8.9327 6 13.434C6 16.7632 8.69175 19.472 12 19.472C15.3082 19.472 18 16.7632 18 13.434C18 10.9267 16.296 8.38022 14.8665 6.68544ZM12.0728 18.5274C11.508 18.544 10.9699 18.3259 10.5259 17.9742C8.3535 16.2537 10.3856 13.4982 11.4469 12.3106C11.7435 11.9789 12.2584 11.9807 12.555 12.3125C13.2742 13.1178 14.4375 14.6416 14.4375 16.0756C14.4375 17.4059 13.3853 18.4885 12.0728 18.5274Z"
					fill="white"
				/>
			</G>
		</SVG>
	);
}
