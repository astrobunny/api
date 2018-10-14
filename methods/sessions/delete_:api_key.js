function complete()
{
  respond_with({message: "OK"}, 200);
}

get_user_by_api_key(api_key, function(user)
{
  var userData = { 
    Username : user.username,
    Pool : userPool
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  // Cognito is shit and cannot sign tokens out properly, so the following line does not work.
  // https://github.com/amazon-archives/amazon-cognito-identity-js/issues/21 <- not an issue wtf
  // https://forums.aws.amazon.com/thread.jspa?threadID=249168 <- aware of the issue
  cognitoUser.signOut();

  // We do our own signout.
  Store.get("api_keys/"+user.api_key, function(api_key_content)
  {
    api_key_content.disabled_tokens = api_key_content.tokens;
    api_key_content.tokens = null;
    Store.set("api_keys/"+user.api_key, api_key_content, function()
    {
      console.log("Invalidated token for", user.username)
      complete();
    }, complete)

  }, complete)

}, function(err)

{
  console.log("Signout error:", err);
  complete();
})
