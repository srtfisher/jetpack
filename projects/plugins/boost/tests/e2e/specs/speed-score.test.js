import { test, expect } from 'jetpack-e2e-commons/fixtures/base-test.js';
import { boostPrerequisitesBuilder } from '../lib/env/prerequisites.js';
import { JetpackBoostPage } from '../lib/pages/index.js';
import { execWpCommand } from 'jetpack-e2e-commons/helpers/utils-helper.cjs';

let jetpackBoostPage;

test.describe( 'Speed Score feature', () => {
	test.beforeAll( async ( { browser } ) => {
		const page = await browser.newPage();
		await boostPrerequisitesBuilder( page ).withCleanEnv().withSpeedScoreMocked( false ).build();
		await execWpCommand( 'plugin activate jetpack-inspect' );
	} );

	test.afterAll( async ( { browser } ) => {
		const page = await browser.newPage();
		await boostPrerequisitesBuilder( page ).withSpeedScoreMocked( true ).build();
	} );

	test.beforeEach( async function ( { page } ) {
		jetpackBoostPage = await JetpackBoostPage.visit( page );
		page.on( 'request', request => {
			if ( /speed-scores/.test( request.url() ) ) {
				console.log( '>>', request.url(), request.method(), request.postData() );
			}
		} );
		page.on( 'response', async response => {
			if ( /speed-scores/.test( response.url() ) ) {
				console.log(
					'<<',
					response.url(),
					response.status(),
					( await response.body() ).toString()
				);
			}
		} );
	} );

	test( 'The Speed Score section should display a mobile and desktop speed score greater than zero', async () => {
		expect(
			await jetpackBoostPage.getSpeedScore( 'mobile' ),
			'Mobile speed score should be greater than 0'
		).toBeGreaterThan( 0 );
		expect(
			await jetpackBoostPage.getSpeedScore( 'desktop' ),
			'Desktop speed score should be greater than 0'
		).toBeGreaterThan( 0 );
	} );

	test( 'The Speed Scores should be able to refresh', async () => {
		await jetpackBoostPage.waitForScoreLoadingToFinish();
		await jetpackBoostPage.clickRefreshSpeedScore();

		expect( await jetpackBoostPage.isScoreLoading(), 'Score should be loading' ).toBeTruthy();
		await jetpackBoostPage.waitForScoreLoadingToFinish();
		expect( await jetpackBoostPage.isScoreVisible(), 'Score should be displayed' ).toBeTruthy();
	} );

	test( 'Should be able to hover info icon next to overall score and see the detailed overall score description popin', async () => {
		await jetpackBoostPage.waitForScoreLoadingToFinish();
		await jetpackBoostPage.page.hover( '.jb-score-context' );
		expect(
			await jetpackBoostPage.isScoreDescriptionPopinVisible(),
			'Score description should be visible'
		).toBeTruthy();
	} );

	for ( let i = 0; i < 100; i++ ) {
		test( 'Fake test to buy time' + i, async () => {
			await new Promise( resolve => setTimeout( resolve, 10000 ) );
			expect( true ).toBeTruthy();
		} );
	}
} );
