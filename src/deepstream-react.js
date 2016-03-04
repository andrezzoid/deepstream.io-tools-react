var LOCAL = 'local';
var dsClient = null;

module.exports = {
	setDeepstreamClient: function( _dsClient ) {
		dsClient = _dsClient;
	},
	componentWillMount: function() {
		this._createRecord();
	},
	getInitialState: function() {
		this._createRecord();
		return this.dsRecord.get();
	},
	componentWillUnmount: function() {
		setTimeout( this._destroy, 0 );
	},
	componentWillUpdate: function( nextProps, nextState ) {
		this.dsRecord.set( this._cloneState( nextState ) );
	},
	_destroy: function() {
		if( this.dsRecord.isDestroyed === false ) {
			this.dsRecord.unsubscribe( this._setState );
			this.dsRecord.discard();
		}

		delete this.dsRecord;
	},
	_setState: function( state ) {
		this.setState( this._cloneState( state ) );
	},
	_cloneState: function( state ) {
		var key,
			clonedState = {};

		for( key in state ) {
			if( key !== LOCAL ) {
				clonedState[ key ] = state[ key ];
			}
		}

		return clonedState;
	},
	_setInitialState: function() {
		if( this.dsRecord && this.dsRecord.isReady && Object.keys( this.dsRecord.get() ).length === 0 && this.state ) {
			this.dsRecord.set( this.state );
		}
	},
	_createRecord: function() {
		if( this.dsRecord ) {
			return;
		}

		if( dsClient === null ) {
			throw new Error( 'no deepstream client set. Please call setDeepstreamClient( ds ) before using the deepstream react mixin' );
		}

		if( typeof this.props.dsRecord !== 'string' ) {
			throw new Error( 'deepstream react mixin requires prop \'dsRecord\'' );
		}

		this.dsRecord = dsClient.record.getRecord( this.props.dsRecord );
		this.dsRecord.subscribe( this._setState );

		if( this.dsRecord.isReady ) {
			setTimeout( this._setInitialState, 0 );
		} else {
			this.dsRecord.once( 'ready', this._setInitialState );
		}
	}
};