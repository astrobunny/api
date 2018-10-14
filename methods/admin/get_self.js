authenticated(params, respond_with, username => {
	get_user_by_username(username, function(data)
		{
			if (data.user.admin)
			{
				respond_with({message: "ADMIN"}, 200);
			}
			else
			{
				respond_with({error: "NOT_ADMIN"}, 401);
			}
		}, 
		function(err)
		{
			respond_with({error: "NOT_ADMIN"}, 401);
		})
})
