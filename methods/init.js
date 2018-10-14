const AWS = require('aws-sdk');
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
global.fetch = require('node-fetch');

String.prototype.replaceAll = function(search, replacement)
{
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

function authenticated(params, respond_with, on_auth)
{
  var api_key = params["api_key"];
  if (api_key && api_key != "null")
  {
    if (authenticated)
    {
      var user = "ok";
      on_auth(user);
    }
    else
    {
      respond_with({message: "forbidden"}, 403);
    }
  }
  else
  {
    respond_with({message: "unauthorized"}, 401);
  }
}
