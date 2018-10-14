var email = params.email
var password = params.password

function fail_login(err)
{
	respond_with({error: "LOGIN_FAILED"}, 401);
}

get_user_by_email(email, function(data)
{
	check_user_creds(data, password, function()
	{
		create_api_key(data, function(api_key)
		{
			respond_with({api_key: api_key}, 200)
			
		}, fail_login)
	}, fail_login)
}, fail_login)
