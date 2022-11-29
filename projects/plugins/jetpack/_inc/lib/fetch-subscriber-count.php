<?php
/**
 * Provides a common source for the fetch_subscriber_count() function.
 *
 * @package automattic/jetpack
 */

namespace Automattic\Jetpack;

use Automattic\Jetpack\Status\Host;
use Jetpack_IXR_Client;

/**
 * Determine the amount of folks currently subscribed to the blog, splitted out in email_subscribers & social_followers
 *
 * @return array containing ['email_subscribers' => 0, 'social_followers' => 0]
 */
function fetch_subscriber_counts() {
	$subs_count = 0;
	if ( ! ( new Host() )->is_wpcom_simple() ) { // If Jetpack.
		$cache_key  = 'wpcom_subscribers_totals';
		$subs_count = get_transient( $cache_key );
		if ( false === $subs_count || 'failed' === $subs_count['status'] ) {
			$xml = new Jetpack_IXR_Client();
			$xml->query( 'jetpack.fetchSubscriberCounts' );

			if ( $xml->isError() ) { // If we get an error from .com, set the status to failed so that we will try again next time the data is requested.

				$subs_count = array(
					'status'  => 'failed',
					'code'    => $xml->getErrorCode(),
					'message' => $xml->getErrorMessage(),
					'value'   => ( isset( $subs_count['value'] ) ) ? $subs_count['value'] : array(
						'email_subscribers' => 0,
						'social_followers'  => 0,
					),
				);
			} else {
				$subs_count = array(
					'status' => 'success',
					'value'  => $xml->getResponse(),
				);
			}
			set_transient( $cache_key, $subs_count, 3600 ); // Try to cache the result for at least 1 hour.
		}
	}

	if ( ( new Host() )->is_wpcom_simple() ) { // If Simple.
		$subs_count = array(
			'email_subscribers' => wpcom_subs_total_for_blog(),
			'social_followers'  => wpcom_social_followers_total_for_blog(),
		);
	}

	return $subs_count;
}

/**
 * Determine the amount of folks currently subscribed to the blog.
 *
 * @param bool $include_publicize_subscribers Include followers through Publicize.
 * @return int
 */
function fetch_subscriber_count( $include_publicize_subscribers = true ) {
	$subs_count = 0;
	if ( ! ( new Host() )->is_wpcom_simple() ) { // If Jetpack.
		$cache_key  = $include_publicize_subscribers ? 'wpcom_subscribers_total' : 'wpcom_subscribers_total_no_publicize';
		$subs_count = get_transient( $cache_key );
		if ( false === $subs_count || 'failed' === $subs_count['status'] ) {
			$xml = new Jetpack_IXR_Client();
			$xml->query( 'jetpack.fetchSubscriberCount', $include_publicize_subscribers );

			if ( $xml->isError() ) { // If we get an error from .com, set the status to failed so that we will try again next time the data is requested.

				$subs_count = array(
					'status'  => 'failed',
					'code'    => $xml->getErrorCode(),
					'message' => $xml->getErrorMessage(),
					'value'   => ( isset( $subs_count['value'] ) ) ? $subs_count['value'] : 0,
				);
			} else {
				$subs_count = array(
					'status' => 'success',
					'value'  => $xml->getResponse(),
				);
			}
			set_transient( $cache_key, $subs_count, 3600 ); // Try to cache the result for at least 1 hour.
		}
	}

	if ( ( new Host() )->is_wpcom_simple() ) { // If Simple.
		if ( $include_publicize_subscribers && function_exists( 'wpcom_reach_total_for_blog' ) ) {
			$subs_count = wpcom_reach_total_for_blog();
		} elseif ( function_exists( 'wpcom_subs_total_for_blog' ) ) {
			$subs_count = wpcom_subs_total_for_blog();
		}
	}

	return $subs_count;
}
