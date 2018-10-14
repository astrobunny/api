function post(username, signature, comment, on_success, on_failure)
{
	var timestamp = new Date().getTime().toString();
	var epoch = Math.floor(new Date().getTime()/1000).toString();
	var key = "comments/"+signature+"/"+timestamp+"_"+username;
	Store.set(key, {comment: comment, url: "/users/"+username, name: username, time:epoch}, on_success, on_failure);
}

authenticated(params, respond_with, username => {
	post(username, signature, params.comment, function()
	{
		respond_with ({message: "MESSAGE_COMMENT_POSTED"}, 200);
	},
	function(err)
	{
		console.log("Comment Post Error: ", err)
		respond_with ({error: "MESSAGE_COULD_NOT_POST"}, 400);
	})
})
