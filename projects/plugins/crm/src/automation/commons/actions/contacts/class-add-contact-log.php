<?php
/**
 * Jetpack CRM Automation Add_Contact_Log action.
 *
 * @package automattic/jetpack-crm
 */

namespace Automattic\Jetpack\CRM\Automation\Actions;

use Automattic\Jetpack\CRM\Automation\Base_Action;

/**
 * Adds the Add_Contact_Log class.
 */
class Add_Contact_Log extends Base_Action {

	/**
	 * @var object The action data.
	 */
	protected $action_data;

	/**
	 * @var array Step data.
	 */
	protected $attributes;

	/**
	 * Add_Contact_Log constructor.
	 *
	 * @param array $action_data An array of the action data.
	 *
	 */
	public function __construct( $action_data ) {
		Base_Action::__construct( $action_data );

		$this->action_data = $action_data;
		$this->attributes  = $action_data['attributes'];
	}

	/**
	 * Get the slug name of the step
	 *
	 * @return string
	 */
	public static function get_slug(): string {
		return 'jpcrm/add_contact_log';
	}

	/**
	 * Get the title of the step
	 *
	 * @return string
	 */
	public static function get_title(): ?string {
		return 'Add Contact Log Action';
	}

	/**
	 * Get the description of the step
	 *
	 * @return string
	 */
	public static function get_description(): ?string {
		return 'Action to add a log to a contact';
	}

	/**
	 * Get the type of the step
	 *
	 * @return string
	 */
	public static function get_type(): string {
		return 'contacts';
	}

	/**
	 * Get the category of the step
	 *
	 * @return string
	 */
	public static function get_category(): ?string {
		return 'actions';
	}

	/**
	 * Get the allowed triggers
	 *
	 * @return array
	 */
	public static function get_allowed_triggers(): ?array {
		return array();
	}

	/**
	 * Add the log to the contact via the DAL.
	 *
	 * @param array $contact_data The contact data on which the log is to be added.
	 */
	public function execute( array $contact_data = array() ) {
		global $zbs;

		$contact_data = $this->attributes;
		$zbs->DAL->contacts->zeroBS_addUpdateObjLog( $contact_data ); // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
	}

}
