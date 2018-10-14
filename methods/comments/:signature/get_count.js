Store.list("comments/"+signature, null, function(data)
{
	respond_with({count: data.length}, 200);
},
function(err)
{
	respond_with({count: 0}, 400);
})
