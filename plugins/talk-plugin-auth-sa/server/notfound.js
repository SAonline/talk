const UserModel = require('../../../models/user');

module.exports = { tokenUserNotFound: async ({jwt, token}) => {
    console.log("NOT FOUND2");
    console.log("JWT:" + JSON.stringify(jwt));

    let profile = jwt;
	
	if (!profile) {
		return null;
	}

	profile.username = profile.username.replace(' ', '_');
	profile.username = profile.username.replace(/\W/g, '');

	let user = await UserModel.findOneAndUpdate({
		id: profile.sub
	}, {
		id: profile.sub,
		username: profile.username,
		lowercaseUsername: profile.username.toLowerCase(),
		roles: [],
		profiles: [
			{
				id: profile.email,
				provider: 'local',
				metadata : {
					confirmed_at : new Date()
				}
			}
		]
	}, {
		setDefaultsOnInsert: true,
		new: true,
		upsert: true
	});

	if( profile.username.toLowerCase()  === user.username.toLowerCase() )
	{
		console.log("Display Name is different");
	}

	return user;

  }
};


