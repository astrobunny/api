var name = params.name
var url = params.url
var email = params.email

function post(email, name, url, signature, comment, on_success, on_failure)
{
	var timestamp = new Date().getTime().toString();
	var epoch = Math.floor(new Date().getTime()/1000).toString();
	var key = "comments/"+signature+"/"+timestamp+"_"+email;
	Store.set(key, {comment: comment, url: url, name: name, email: email, time:epoch}, on_success, on_failure);
}

post(email, name, url, signature, params.comment, function()
{
	respond_with ({message: "MESSAGE_COMMENT_POSTED"}, 200);
},
function(err)
{
	console.log("Comment Post Error: ", err)
	respond_with ({error: "MESSAGE_COULD_NOT_POST"}, 400);
})
