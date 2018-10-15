authenticated(params, respond_with, username => {

	Store.list("usercomments/"+username, null, function(data)
	{
		var results = [];
		function load()
		{
			var key = data.shift();
			Store.get(key, 
				function(comment)
				{
					results.push(comment)
						console.log(results)
					if (data.length === 0)
					{
						respond_with({result: results}, 200);
					}
					else
					{
						load();
					}
				}, 
				function(err)
				{
					console.log(err)
					respond_with({err: "NO_COMMENTS"}, 400);
				})
		}

		load();
	},
	function(err)
	{
		console.log(err)
		respond_with({err: "NO_COMMENTS"}, 400);
	});

})
