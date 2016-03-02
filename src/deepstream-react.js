var LOCAL = 'local';
var dsClient;

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
	_onRecordReady: function() {
		if( this.dsRecord && Object.keys( this.dsRecord.get() ).length === 0 && this.state ) {
			this.dsRecord.set( this.state );
		}
	},
	_createRecord: function() {
		if( this.dsRecord ) {
			return;
		}

		if( typeof this.props.recordName !== 'string' ) {
			throw new Error( 'deepstream react mixin requires prop \'recordName\'' );
		}

		this.dsRecord = dsClient.record.getRecord( this.props.recordName );
		this.dsRecord.subscribe( this._setState );
		if( this.dsRecord.isReady ) {
			this._onRecordReady();
		} else {
			this.dsRecord.once( 'ready', this._onRecordReady );
		}
	}
};