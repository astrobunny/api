var name = params.name
var url = params.url
var email = params.email

post_comment(email, name, url, signature, params.comment, function()
{
	respond_with ({message: "MESSAGE_COMMENT_POSTED"}, 200);
},
function(err)
{
	console.log("Comment Post Error: ", err)
	respond_with ({error: "MESSAGE_COULD_NOT_POST"}, 400);
})
