
var React = require('react');
var ReactDOM = require('react-dom');
var deepstream = require( 'deepstream.io-client-js' );
var DeepstreamMixin = require( './deepstream-react' );


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
		var classes = this.state.isDone ? 'fa fa-fw fa-check-square-o' : 'fa fa-fw fa-square-o';
		return (
			<li>
				<input type="text" value={this.state.title} onChange={this.setTitle} />
				<div className={classes} onClick={this.toggleDone}></div>
				<div className="fa fa-close" onClick={this.remove}></div>
			</li>
		)
	}
});

var TodoApp = React.createClass({
	mixins: [ DeepstreamMixin ],
	getInitialState: function() {
		return {
			local: {
				text: ''
			},
			items: []
		}
	},
	handleSubmit: function(e) {
		e.preventDefault();
		var id = 'todo/' + ds.getUid();

		ds.record.getRecord( id ).set({
			title: this.state.local.text,
			isDone: false
		});

		this.setState({
			local: { text: '' },
			items: this.state.items.concat([ id ])
		});
	},
	onInputUpdate: function(e){
		this.setState({
			local: {
				text: e.target.value
			}
		});
	},
	render: function() {
		var todos = this.state.items.map(function( item ){
			return <TodoItem key={item} recordName={item} />
		});
		return (
			<div>
				<ul>
					{todos}
				</ul>
				<form onSubmit={this.handleSubmit}>
					<input value={this.state.local.text} onChange={this.onInputUpdate} />
					<button>Add</button>
				</form>
			</div>
		);
	}
});

ds = deepstream( 'localhost:6020' ).login({}, function(){
	ReactDOM.render(<TodoApp recordName="todos" />, document.getElementById( 'example' ));
});

DeepstreamMixin.setDeepstreamClient( ds );