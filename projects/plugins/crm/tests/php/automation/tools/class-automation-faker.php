<?php

namespace Automattic\Jetpack\CRM\Automation\Tests;

use Automattic\Jetpack\CRM\Automation\Tests\Mocks\Contact_Condition;

require_once __DIR__ . '/class-event-emitter.php';

class Automation_Faker {

	private static $instance;

	public static function instance(): Automation_Faker {
		if ( ! self::$instance ) {
			self::$instance = new self();
			self::$instance->load_mocks();
		}

		return self::$instance;
	}

	/**
	 * Return a basic workflow
	 * @return array
	 */
	public function basic_workflow(): array {
		return array(
			'name'         => 'Workflow Test',
			'description'  => 'Test: the description of the workflow',
			'category'     => 'Test',
			'is_active'    => true,
			'triggers'     => array(
				'jpcrm/contact_created',
			),
			'initial_step' => array(
				'slug'       => 'send_email_action',
				'attributes' => array(
					'to'       => 'admin@example.com',
					'template' => 'send_welcome_email',
				),
				'next_step'  => null,
			),
		);
	}

	/**
	 * Return a basic workflow with a trigger and without initial step
	 * @return array
	 */
	public function workflow_without_initial_step(): array {
		return array(
			'name'        => 'Workflow Test',
			'description' => 'Test: the description of the workflow',
			'category'    => 'Test',
			'is_active'   => true,
			'triggers'    => array(
				'jpcrm/contact_created',
			),
		);
	}

	/**
	 * Return a basic workflow with a customizable trigger and without initial step
	 *
	 * @param string $trigger_name The name of the trigger to be included in the workflow.
	 *
	 * @return array
	 */
	public function workflow_without_initial_step_customize_trigger( $trigger_name ): array {
		return array(
			'name'        => 'Workflow Test',
			'description' => 'Test: the description of the workflow',
			'category'    => 'Test',
			'is_active'   => true,
			'triggers'    => array(
				$trigger_name,
			),
		);
	}

	/**
	 * Return dummy contact triggers name list
	 * @return array
	 */
	public function contact_triggers(): array {
		return array(
			'jpcrm/contact_created',
			'jpcrm/contact_updated',
			'jpcrm/contact_deleted',
		);
	}

	/**
	 * Return dummy invoice triggers name list
	 * @return array
	 */
	public function invoice_triggers(): array {
		return array(
			'invoice_created',
			'invoice_updated',
			'invoice_deleted',
		);
	}

	/**
	 * Return a workflow with a condition and an action
	 * @return array
	 */
	public function workflow_with_condition_action(): array {
		return array(
			'name'         => 'Workflow Test',
			'description'  => 'Test: the description of the workflow',
			'category'     => 'Test',
			'is_active'    => true,
			'triggers'     => array(
				'jpcrm/contact_created',
			),
			'initial_step' => array(
				'slug'            => 'contact_status_condition',
				'class_name'      => Contact_Condition::class,
				'attributes'      => array(
					'field'    => 'status',
					'operator' => 'is',
					'value'    => 'lead',
				),
				'next_step_true'  => array(
					'slug' => 'dummy_action',
				),
				'next_step_false' => null,
			),
		);
	}

	/**
	 * Return a workflow with a condition and an action
	 * @return array
	 */
	public function workflow_with_condition_customizable_trigger_action( $trigger_name, $action_data ): array {
		return array(
			'name'         => 'Workflow Test',
			'description'  => 'Test: the description of the workflow',
			'category'     => 'Test',
			'is_active'    => true,
			'triggers'     => array(
				$trigger_name,
			),
			'initial_step' => array(
				'slug'            => 'contact_status_condition',
				'class_name'      => Contact_Condition::class,
				'attributes'      => array(
					'field'    => 'status',
					'operator' => 'is',
					'value'    => 'lead',
				),
				'next_step_true'  => $action_data,
				'next_step_false' => null,
			),
		);
	}

	/**
	 * Load all mock classes present in the mocks folder
	 *
	 * @return void
	 */
	private function load_mocks() {

		$mocks_dir = __DIR__ . '/../mocks/';
		$mocks     = scandir( $mocks_dir );

		foreach ( $mocks as $mock ) {
			if ( strpos( $mock, 'mock-class-' ) === 0 ) {
				require_once $mocks_dir . $mock;
			}
		}
	}

	public function contact_data() {
		return array(
			'id'   => 1,
			'data' => array(
				'status' => 'lead',
				'name'   => 'John Doe',
				'email'  => 'johndoe@example.com',
			),
		);
	}

	/**
	 * Return a empty workflow, without triggers and initial step
	 * @return array
	 */
	public function empty_workflow(): array {
		return array(
			'name' => 'Empty workflow Test',
		);
	}
}
