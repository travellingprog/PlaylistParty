// Make the password optional. You'll need to make a dummy Password
// for everyone that doesn't want a password

// Make a confirm password field.

// (server and user)
Accounts.createUser({
  username: "user1",	
  password: "maybeBlank", 
  profile: {playlist: "playlistID"}}, 
  function (error) {
	if (error) {
		// display error message
	}
	// if no error, user is logged in automatically
});

// Use {{#if currentUser}} to check whether the user is logged in.

// use {{currentUser}} in handlebars to pass user info to the template



// (server) Validate username, sending a specific error message on failure.
Accounts.validateNewUser(function (user) {
  if (user.username)
    return true;
  throw new Meteor.Error(403, "Username cannot be blank");
});

// (server) 
Accounts.validateNewUser(function (user) {
  if (playlist exists)
    return true;
  throw new Meteor.Error(403, "Not a Valid playlist");
});


// (server) 
Accounts.onCreateUser(function(options, user) {
  // Add user to the playlist's list of users
  return user;
});


// (client)
Meteor.loginWithPassword("user1", "password", function (error) {
  if (error) {
    // report error
  }
});


// (db) Users document example
{
  _id: "bbca5d6a-2156-41c4-89da-0329e8c99a4f",  // Meteor.userId()
  username: "cool_kid_13", // unique name
  emails: [
    // each email address can only belong to one user.
    { address: "cool@example.com", verified: true },
    { address: "another@different.com", verified: false }
  ],
  createdAt: 1349761684042,
  profile: {
    // The profile is writable by the user by default.
    name: "Joe Schmoe"
  },
  services: {
    facebook: {
      id: "709050", // facebook id
      accessToken: "AAACCgdX7G2...AbV9AZDZD"
    },
    resume: {
      loginTokens: [
        { token: "97e8c205-c7e4-47c9-9bea-8e2ccc0694cd",
          when: 1349761684048 }
      ]
    }
  }
}



// By default, the current user's username, emails 
// and profile are published to the client.

// To forbid users from making any modifications to their user 
// document:
Meteor.users.deny({update: function () { return true; }});



