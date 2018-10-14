// Register a user

var email = params.email
var username = params.username
var password = params.password
var password2 = params.password2

if (password !== password2)
{
	return respond_with ({message: "MESSAGE_PASSWORD_NOT_SAME"}, 400);
}

var poolData = {
	UserPoolId : 'ap-northeast-1_IzB06CzW0',
    ClientId : '7l0r0ndg9s8lrhv3d3dshfbn7m'
};

var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

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

userPool.signUp(username, password, attributeList, null, function(err, result)
{
    if (err)
    {
		respond_with ({message: err}, 400);
        return;
    }
    cognitoUser = result.user;
    console.log('user name is ' + cognitoUser.getUsername());
	respond_with ({username: cognitoUser.getUsername()}, 201);
});
