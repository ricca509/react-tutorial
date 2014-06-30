/** @jsx React.DOM */

var converter = new Showdown.converter();

var CommentsCollection = Backbone.Collection.extend({
    url: '/comments.json'
});

var commentsCollection = new CommentsCollection();

var CommentBox = React.createClass({
    render: function () {
        return (
            <div className="commentBox">
                <h1>Comments</h1>
                <CommentForm collection={ commentsCollection } />
                <CommentList collection={ commentsCollection } pollInterval={ this.props.pollInterval } />
            </div>
        );
    }
});

var Comment = React.createClass({
    render: function () {
        var rawMarkup = converter.makeHtml(this.props.children.toString());
        return (
            <li className="comment">
                <b className="commentAuthor">Author: {this.props.author}</b>
                <span dangerouslySetInnerHTML={ {__html: rawMarkup} } />
            </li>
        );
    }
});

var CommentList = React.createClass({
    getInitialState: function () {
        return ({collection: this.props.collection});
    },
    componentWillMount: function () {
        this.props.collection.on('add remove change', this.collectionChanged, this);

        this.props.collection.fetch();
        setInterval(function () {
            this.props.collection.fetch();
        }.bind(this), this.props.pollInterval);
    },
    componentWillUnmount: function () {
        this.props.collection.off(null, null, context);
    },
    collectionChanged: function () {
        this.setState({collection: this.props.collection});
    },
    getCommentComponents: function () {
        return this.state.collection.map(function (comment, index) {
            return (
                <Comment key={ index } author={ comment.get('author') }>
                    { comment.get('text') }
                </Comment>
            );
        }).reverse();
    },
    render: function () {
        return <ul className="commentList">{ this.getCommentComponents() }</ul>;
    }
});

var CommentForm = React.createClass({
    handleSubmit: function (e) {
        e.preventDefault();
        var author = this.refs.author.getDOMNode().value.trim();
        var text = this.refs.text.getDOMNode().value.trim();
        this.refs.author.getDOMNode().value = '';
        this.refs.text.getDOMNode().value = '';

        this.changeCollection({author: author, text: text})

        return false;
    },
    changeCollection: function (data) {
        this.props.collection.create({
            author: data.author,
            text: data.text
        });
    },
    render: function () {
        return (
            <form className="commentForm" onSubmit={ this.handleSubmit }>
                <input type="text" placeholder="Your name" ref="author" />
                <input type="text" placeholder="Say something..." ref="text" />
                <input type="submit" value="Post" />
            </form>
        );
    }
});

React.renderComponent(
    <CommentBox pollInterval={2000} />,
    document.getElementById('container')
);
