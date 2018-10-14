authenticated(params, respond_with, username => {
	console.log(params)
	post_comment(username, username, "/users/?name=username", signature, params.comment, function()
	{
		respond_with ({message: "MESSAGE_COMMENT_POSTED"}, 200);
	},
	function(err)
	{
		console.log("Comment Post Error: ", err)
		respond_with ({error: "MESSAGE_COULD_NOT_POST"}, 400);
	})
})
