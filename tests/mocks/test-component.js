var DeepstreamReact = require( '../../src/deepstream-react' );
var React = require('react');

var TestComponent = React.createClass({
	mixins: [ DeepstreamReact ],
	getInitialState: function() {
		return {
			remoteVal: 'initial-remote',
			local: { localVal: 'initial-local' }
		};
	},
	setRemoteVal: function( e ) {
		this.setState({ remoteVal: e.target.value });
	},
	setLocalVal: function( e ) {
		this.setState({
			local: {localVal: e.target.value }
		});
	},
	render: function() {
		return (
			<div>
				<input id="remoteVal" type="text" value={this.state.remoteVal} onChange={this.setRemoteVal} />
				<input id="lovalVal" type="text" value={this.state.local.localVal} onChange={this.setLocalVal} />
			</div>
		)
	}
});

module.exports = TestComponent;