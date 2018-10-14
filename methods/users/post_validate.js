var token = params["token"];
var email = params["email"];
var password = params["password"];

function mark_as_verified(data, on_failure)
{
  data.user.verified = true;
  Store.set("users/"+data.cognito.Username, data.user, function()
  {
    create_api_key(data, function(api_key)
      {
        respond_with({api_key: api_key}, 200)
      }, on_failure);
  }, on_failure)
}

function confirm_user(data, on_failure)
{
  if (data.cognito.UserStatus === "UNCONFIRMED")
  {
    // confirm user with cognito
    var userData = { 
      Username : data.cognito.Username,
      Pool : userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.confirmRegistration(token, true, function(err, result)
    {
      if (err) 
      {
        return on_failure(err)
      }
      
      console.log('confirm result: ' + result);
      check_user_creds(data, password, function()
      {
        mark_as_verified(data, on_failure);
      }, on_failure);
    });
  }
  else if (data.cognito.UserStatus === "CONFIRMED")
  {
    // confirmed already. we need to confirm on our side.
    check_user_creds(data, password, function()
    {
      mark_as_verified(data, on_failure);
    }, on_failure);
  }
  else
  {
    on_failure({error: username + " cannot be verified because status = " + data.cognito.UserStatus})
  }
}

function run(on_failure)
{
  get_user_by_email(email, data =>
  {
    if (data.user.verified || !data.cognito.Enabled)
    {
      // Already verified or disabled in cognito
      return respond_with({error: "CANNOT_CONFIRM_THIS_USER"}, 400);
    }
    confirm_user(data, on_failure);

  }, on_failure)
}

run(function(err)
{
  console.log(err);
  return respond_with({error: "CANNOT_CONFIRM_THIS_USER"}, 400);
});
