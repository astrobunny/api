const AWS = require('aws-sdk');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const crypto = require('crypto');

// === GLOBALS ===

global.fetch = require('node-fetch');

String.prototype.replaceAll = function(search, replacement)
{
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

// === PUBLICS ===

const poolData = {
  UserPoolId : 'ap-northeast-1_IzB06CzW0',
  ClientId : '7l0r0ndg9s8lrhv3d3dshfbn7m'
};

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
const cisp = new AWS.CognitoIdentityServiceProvider({region: "ap-northeast-1"});

// === UTILITIES ===

function create_api_key(data, on_success, on_failure)
{
  const hash = crypto.createHmac('sha256', data.cognito.Username)
                   .update( JSON.stringify(data.tokens) )
                   .digest('hex');

  var api_data = {
    username: data.cognito.Username,
    tokens: data.tokens,
    token_version: data.user.token_version
  }

  Store.set("api_keys/"+hash, api_data, function()
  {
    console.log("User logged in: ", data.cognito.Username);
    on_success(hash);
  }, on_failure)
}

function check_user_creds(data, password, on_success, on_failure)
{
  var userData = { 
    Username : data.cognito.Username,
    Pool : userPool
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  var params = {
    AuthFlow: "ADMIN_NO_SRP_AUTH",
    ClientId: poolData.ClientId,
    UserPoolId: poolData.UserPoolId,
    AuthParameters: {
      USERNAME: data.cognito.Username,
      PASSWORD: password
    }
  }

  cisp.adminInitiateAuth(params, function(err, tokens)
  {
    if (err)
    {
      return on_failure(err);
    }

    data.tokens = tokens;

    on_success()
  });

  return;
}

function refresh_user_token(data, on_success, on_failure)
{
  var params = {
    AuthFlow: "REFRESH_TOKEN",
    ClientId: poolData.ClientId,
    AuthParameters: {
      REFRESH_TOKEN: data.tokens.AuthenticationResult.RefreshToken
    }
  };

  console.log(Object.keys(data.tokens.AuthenticationResult))
  cisp.initiateAuth(params, function(err, tokendata)
  {
    if (err)
    {
      console.log("refresh_user_token")
      on_failure(err);
    }
    else
    {
      data.tokens = tokendata

      var api_data = {
        username: data.username,
        tokens: data.tokens
      }

      console.log(data.api_key)

      Store.set("api_keys/"+data.api_key, api_data, function()
      {
        console.log("Refreshed token for", data.username)
        on_success();
      }, on_failure)
    }
  })
}

function check_user(data, on_success, on_failure)
{
  var params = {
    AccessToken: data.tokens.AuthenticationResult.AccessToken
  }
  cisp.getUser(params, function(err, cognitodata) {
    if(err)
    {
      console.log("check_user")
      on_failure(err);
    }
    else
    {
      if (cognitodata.Username === data.username)
      {
        console.log("a", data.user.token_version)
        console.log("b", data.tokens.token_version)
        if (data.user.token_version === data.tokens.token_version)
        {
          on_success(data);
        }
        else
        {
          on_failure({err: "Token version changed. Logged out."})
        }
      }
      else
      {
        on_failure({err: "Recorded username and cognito usernames don't match", recorded: data.username, cognito: cognitodata.Username});
      }
    }
  });
}

function get_user_by_api_key(api_key, on_success, on_failure)
{
  Store.get("api_keys/"+api_key, function(tokendata)
  {
    tokendata.api_key = api_key;
    get_user_by_username(tokendata.username, function(data)
    {
      data.api_key = tokendata.api_key;
      data.tokens = tokendata.tokens;
      data.username = tokendata.username;

      if (!data.tokens)
      {
        // Has been cleared by logout
        return on_failure("This token has logged out.")
      }
      data.tokens.token_version = tokendata.token_version;
      check_user(data, on_success, function(err)
      {
        refresh_user_token(data, function()
        {
          check_user(data, on_success, on_failure);
        }, on_failure);
      });

    }, on_failure)

  }, on_failure);
}

function authenticated(params, respond_with, on_auth)
{
  var api_key = params["api_key"];
  if (api_key && api_key != "null")
  {
    get_user_by_api_key(api_key, function(user)
    {
      on_auth(user.username, user);
    },
    function(err)
    {
      console.log("Authentication Error: " + err);
      respond_with({message: "forbidden"}, 403);
    })
  }
  else
  {
    respond_with({message: "unauthorized"}, 401);
  }
}

function get_user_by_username(username, on_success, on_failure)
{
  Store.get("users/"+username, function(userdata)
  {
    var params = {
      UserPoolId: poolData.UserPoolId,
      Username: username
    };

    cisp.adminGetUser(params, function(err, cognitodata) {
      if (err)
      {
        console.log("Error:", err);
        on_failure(err);
      }
      else
      {
        var user = {
          user: userdata,
          cognito: cognitodata
        };
        on_success(user);
      }
    });

  }, on_failure);
}

function get_user_by_email(email, on_success, on_failure)
{
  if (!email || email.length == 0)
  {
    return;
  }

  Store.get("emails/"+email, function(data)
  {
    get_user_by_username(data.username, on_success, on_failure);
  }, on_failure)
}
