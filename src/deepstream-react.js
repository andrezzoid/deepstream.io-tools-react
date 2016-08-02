/**
 * deepstream-react
 *
 * this is a mixin that bi-directionally syncs the state of a
 * react-component with a deepstream-record and propagates any change accross
 * all connected clients
 *
 * @copyright 2016 deepstreamHub GmbH i. Gr.
 *
 * @license MIT
 * @author Wolfram Hempel <wolfram.hempel@deepstreamhub.com>
 */
(function( global ){

	/**
	 * Everything under the local namespace within a component's state
	 * will be excluded from being synced
	 *
	 * @constant
	 * @private
	 * @type {String}
	 */
	var LOCAL = 'local';

	/**
	 * The client instance for all react-deepstream mixins
	 *
	 * @private
	 * @type {DeepstreamClient}
	 */
	var dsClient = null;

	var DeepstreamReactMixin = {

		/**
		 * This method must be called with a connected deepstream client instance
		 * before the mixin can be used. It is a static method on the constructor,
		 * so calling it will set the client for all future component's using this mixin
		 *
		 * @example
		 *
		 * var ReactDeepstream = require( 'react-deepstream' );
		 *
		 * ds = deepstream( 'localhost:6020' ).login({}, function(){
		 *		ReactDOM.render(<TodoApp dsRecord="todos" />, document.getElementById( 'example' ));
		 * });
		 *
		 * ReactDeepstream.setDeepstreamClient( ds );
		 *
		 * @static
		 * @param {DeepstreamClient} _dsClient
		 *
		 * @returns {void}
		 */
		setDeepstreamClient: function( _dsClient ) {
			dsClient = _dsClient;
		},

		/**
		 * React lifecycle method. The associated record is created either in componentWillMount
		 * or getInitialState, depending on what's called first.
		 *
		 * @interface
		 * @returns {void}
		 */
		componentWillMount: function() {
			this._createRecord();
		},

		/**
		 * React lifecycle method. If the record is already loaded at this point and has a state
		 * it will be returned. Can be overwritten by implementing component
		 *
		 * @interface
		 * @returns {Object} initialState
		 */
		getInitialState: function() {
			this._createRecord();
			return this.dsRecord.get();
		},

		/**
		 * React lifecycle method. Discards the record and releases associated bindings
		 * after react has completed the unmounting
		 *
		 * @interface
		 * @returns {void}
		 */
		componentWillUnmount: function() {
			setTimeout( this._destroy, 0 );
		},

		/**
		 * React lifecycle method. Marks a change to setState.
		 *
		 * @param   {[type]} nextProps [description]
		 * @param   {[type]} nextState [description]
		 *
		 * @returns {[type]}
		 */
		componentWillUpdate: function( nextProps, nextState ) {
			this.dsRecord.set( this._cloneState( nextState ) );
		},

		/**
		 * Removes all subscriptions and discards the record. This does not
		 * delete the record, but tells the deepstreamServer that we're no longer
		 * interested in updates.
		 *
		 * @private
		 * @returns {void}
		 */
		_destroy: function() {
			if( this.dsRecord.isDestroyed === false ) {
				this.dsRecord.unsubscribe( this._setState );
				this.dsRecord.discard();
			}

			delete this.dsRecord;
		},

		/**
		 * Set's the component's state to a shallow copy of the provided
		 * state, minus the local namespace
		 *
		 * @param {Object} state a serializable component state
		 *
		 * @private
		 * @returns {void}
		 */
		_setState: function( state ) {
			this.setState( this._cloneState( state ) );
		},

		/**
		 * Creates a shallow copy of the state and omits the local namespace
		 *
		 * @param {Object} state a serializable component state
		 *
		 * @private
		 * @returns {Object} clonedState a serializable component state
		 */
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

		/**
		 * Set's the record's initial dataset, but only if the record is present, is empty and
		 * the state is populated. This would most likely be the case for new react components that
		 * expose a getInitialState method
		 *
		 * @private
		 * @returns {void}
		 */
		_setInitialState: function() {
			if( this.dsRecord && this.dsRecord.isReady && Object.keys( this.dsRecord.get() ).length === 0 && this.state ) {
				this.dsRecord.set( this.state );
			}
		},

		/**
		 * Creates / Retrieves the record this component's state is synced with. This method is called either by getInitialState
		 * or componentWillMount - whatever comes first
		 *
		 * @private
		 * @returns {void}
		 */
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

			/*
			 * We can't use record.whenReady here since react complains about its internal usage of `bind`
			 */
			if( this.dsRecord.isReady ) {
				setTimeout( this._setInitialState, 0 );
			} else {
				this.dsRecord.once( 'ready', this._setInitialState );
			}
		}
	};

	 if(typeof module === 'object' && module.exports) {
		module.exports = DeepstreamReactMixin;
	} else {
		global.DeepstreamReactMixin = DeepstreamReactMixin;
	}

})( this );