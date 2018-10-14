// Register a user

var email = params.email
var username = params.username
var password = params.password
var password2 = params.password2

if (password !== password2)
{
  return respond_with ({message: "MESSAGE_PASSWORD_NOT_SAME"}, 400);
}

function make_attribute(thing)
{
  return new AmazonCognitoIdentity.CognitoUserAttribute({
    Name: thing,
    Value: params[thing]
  })
}

var attributeList = [];
attributeList.push(make_attribute('email'));

var cognitoUser;

function store_email(theusername, email, on_failure)
{
    Store.set( "emails/" + email, {
        username: theusername
      },
      
      function()
      {
        console.log('User created:' + theusername);
        respond_with ({username: theusername}, 201);
      },

      on_failure);
}

function store_user(theusername, email, on_failure)
{
  var timestamp = new Date().getTime().toString();

  Store.set( "users/" + theusername, {
      email: email,
      verified: false,
      // this version is on all tokens created at this time. if a token does not have the same version, it is invalid.
      // to global signout, just change this version.
      token_version: timestamp
    },

    function()
    {
      store_email(theusername, email, on_failure);
    },

    on_failure);
}

userPool.signUp(username, password, attributeList, null, function(err, result)
{
  if (err)
  {
    console.log("Error cognito signup: ", err);
    respond_with ({error: "MESSAGE_UNABLE_TO_SIGN_UP"}, 400);
    return;
  }
  cognitoUser = result.user;
  var theusername = cognitoUser.getUsername();

  store_user(theusername, email, 
    function(err)
    {
      console.log("Error recording: ", err);
      respond_with ({error: "MESSAGE_UNABLE_TO_SIGN_UP"}, 400);
    });
});
