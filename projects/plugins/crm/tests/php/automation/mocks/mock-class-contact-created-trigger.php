<?php

namespace Automatic\Jetpack\CRM\Automation\Tests\Mocks;

use Automattic\Jetpack\CRM\Automation\Automation_Workflow;
use Automattic\Jetpack\CRM\Automation\Base_Trigger;
use Automattic\Jetpack\CRM\Automation\Tests\Event_Emitter;

class Contact_Created_Trigger extends Base_Trigger {

	/** Get the slug name of the trigger
	 * @return string
	 */
	public static function get_slug(): string {
		return 'jpcrm/contact_created';
	}

	/** Get the title of the trigger
	 * @return string 
	 */
	public static function get_title(): ?string {
		return __( 'Contact Created', 'zero-bs-crm' );
	}

	/** Get the description of the trigger
	 * @return string 
	 */
	public static function get_description(): ?string {
		return __( 'Triggered when a CRM contact is created'. 'zero-bs-crm' );
	}

	/** Get the category of the trigger
	 * @return string 
	 */
	public static function get_category(): ?string {
		return __( 'contact', 'zero-bs-crm' );
	}

	/**
	 * Listen to the desired event
	 */
	protected function listen_to_event() {
		$event_emitter = Event_Emitter::instance();

		$event_emitter->on(
			'contact_created',
			array( $this, 'execute_workflow' )
		);
	}
}
