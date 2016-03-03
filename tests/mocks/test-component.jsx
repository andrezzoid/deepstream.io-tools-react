var DeepstreamReact = require( '../../src/deepstream-react' );
var React = require('react');

var TodoItem = React.createClass({
	mixins: [ DeepstreamMixin ],
	toggleDone: function( e ) {
		this.setState({ isDone: !this.state.isDone });
	},
	setTitle: function( e ) {
		this.setState({ title: e.target.value });
	},
	remove: function() {
		this.dsRecord.delete();
		var todos = ds.record.getRecord( 'todos' );
		var items = todos.get( 'items' );
		items.splice( items.indexOf( this.props.recordName ), 1 );
		todos.set( 'items', items );
	},

	render: function() {
		return (
			<li>
				<input type="text" value={this.state.title} onChange={this.setTitle} />
				<div className={this.state.isDone ? 'fa fa-fw fa-check-square-o' : 'fa fa-fw fa-square-o'} onClick={this.toggleDone}></div>
				<div className="fa fa-close" onClick={this.remove}></div>
			</li>
		)
	}
});

module.exports = TodoItem;