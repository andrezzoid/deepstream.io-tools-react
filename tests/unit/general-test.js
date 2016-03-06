var DeepstreamReact = require( '../../src/deepstream-react' );
var React = require('react');
var ReactDOM = require('react-dom');
var ReactTestUtils = require('react-addons-test-utils');
var TestComponent = require( '../mocks/test-component' );
var deepstream = require( 'deepstream.io-client-js');

describe( 'creates a component with deepstream-react mixin', function(){
	var ds;
	var testDomContainer = document.createElement( 'div' );
	var remoteInput;
	var localInput;
	var nestedInput;
	var testRecord;
	var recordName = 'text/' + Math.random();

	it( 'throws an error if no deepstream client is set', function(){
		var error;
		try{
			ReactDOM.render(<TestComponent />, testDomContainer );
		} catch( e ) {
			error = e;
		}
		expect( error.toString() ).toBe( 'Error: no deepstream client set. Please call setDeepstreamClient( ds ) before using the deepstream react mixin' );
	});

	it( 'establishes a connection with the server', function( done ){
		ds = deepstream( 'localhost:6020' );
		ds.login({}, function( success ){
			expect( success ).toBe( true );
			DeepstreamReact.setDeepstreamClient( ds );
			done();
		});
	});

	it( 'throws an error no recordName property is specified', function(){
		var error;
		try{
			ReactDOM.render(<TestComponent />, testDomContainer );
		} catch( e ) {
			error = e;
		}
		expect( error.toString() ).toBe( 'Error: deepstream react mixin requires prop \'dsRecord\'' );
		expect( testDomContainer.childElementCount ).toBe( 0 );
	});

	it( 'successfully creates the test component', function( done ){
		ReactDOM.render(<TestComponent dsRecord={recordName} />, testDomContainer );
		expect( testDomContainer.childElementCount ).toBe( 1 );
		var inputs = testDomContainer.getElementsByTagName( 'input' );
		remoteInput = inputs[ 0 ];
		localInput = inputs[ 1 ];
		nestedInput = inputs[ 2 ];
		expect( remoteInput.value ).toBe( 'initial-remote' );
		expect( localInput.value ).toBe( 'initial-local' );
		expect( nestedInput.value ).toBe( 'initial-nested' );
		setTimeout( done, 300 );
	});

	it( 'synced the component\'s initial state', function(){
		testRecord = ds.record.getRecord( recordName );
		expect( testRecord.get( 'remoteVal' ) ).toBe( 'initial-remote' );
		expect( testRecord.get( 'local' ) ).toBe( undefined );
	});

	it( 'updates the remote value', function( done ){
		remoteInput.value = 'remote-change-1';
		ReactTestUtils.Simulate.change( remoteInput );
		setTimeout(function(){
			expect( testRecord.get() ).toEqual({
				remoteVal: 'remote-change-1',
				nested: { nestedVal: 'initial-nested' }
			});
			done();
		}, 200 );
	});

	it( 'updates the local value', function( done ){
		localInput.value = 'local-change-1';
		ReactTestUtils.Simulate.change( localInput );
		setTimeout(function(){
			expect( testRecord.get() ).toEqual({
				remoteVal: 'remote-change-1',
				nested: { nestedVal: 'initial-nested' }
			});
			done();
		}, 200 );
	});

	it( 'updates the remote value again', function( done ){
		remoteInput.value = 'remote-change-2';
		ReactTestUtils.Simulate.change( remoteInput );
		setTimeout(function(){
			expect( testRecord.get() ).toEqual({
				remoteVal: 'remote-change-2',
				nested: { nestedVal: 'initial-nested' }
			});
			done();
		}, 200 );
	});

	it( 'updates a nested value', function( done ){
		nestedInput.value = 'nested-change-1';
		ReactTestUtils.Simulate.change( nestedInput );
		setTimeout(function(){
			expect( testRecord.get() ).toEqual({
				remoteVal: 'remote-change-2',
				nested: { nestedVal: 'nested-change-1' }
			});
			done();
		}, 200 );
	});

	it( 'renders incoming changes', function( done ){
		testRecord.set( 'remoteVal', 'remote-change-3' );
		setTimeout(function(){
			expect( remoteInput.value ).toBe( 'remote-change-3' );
			done();
		}, 200 );
	});

	it( 'renders incoming changes to nested values', function( done ){
		testRecord.set( 'nested.nestedVal', 'nested-change-2' );
		setTimeout(function(){
			expect( nestedInput.value ).toBe( 'nested-change-2' );
			done();
		}, 200 );
	});


	it( 'destroys the component', function( done ){
		expect( testRecord.usages ).toBe( 2 );
		expect( testDomContainer.childElementCount ).toBe( 1 );
		ReactDOM.unmountComponentAtNode( testDomContainer );
		setTimeout(function(){
			expect( testDomContainer.childElementCount ).toBe( 0 );
			expect( testRecord.usages ).toBe( 1 );
			done();
		}, 200 );
	});

	it( 'closes the client', function( done ){
		ds.close();
		setTimeout( done, 500 );
	});
});