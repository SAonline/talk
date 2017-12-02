const UserModel = require('../../../models/user');

module.exports = { tokenUserNotFound: async ({jwt, token}) => {

    let profile = jwt;
	
	if (!profile) {
		return null;
	}

	if( !profile.username)
	{
		return null;
	}
	profile.username = profile.username.replace(' ', '_');
	profile.username = profile.username.replace(/\W/g, '');

	let dbUser = await UserModel.findOne({
		$or: [
			{ 'profiles': { $elemMatch: { 'id': profile.email } } },
			{ 'id': profile.subid }
		]
	});

	if( !dbUser ) 
	{
		let user = await UserModel.findOneAndUpdate({
			$or: [
				{ 'profiles': { $elemMatch: { 'id': profile.email } } },
				{ 'id': profile.subid }
			]
		}, {
			id: profile.subid,
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

		return user;

	} else {

		if( ( profile.subid && dbUser.id != profile.subid ) )
		{
			let dbUser = await UserModel.findOneAndUpdate({
				'profiles': { $elemMatch: { 'id': profile.email } }
			}, {
				id: profile.subid
			}, {
				upsert: false,
				returnNewDocument: true
			});
		} 

		if ( profile.email && dbUser.profiles[0].id != profile.email ) 
		{
			let dbUser = await UserModel.findOneAndUpdate({
				'id': profile.subid 
			}, {
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
				upsert: false,
				returnNewDocument: true
			});
		}

		if( profile.username && dbUser.username != profile.username )
		{
			let dbUser = await UserModel.findOneAndUpdate({
				'profiles': { $elemMatch: { 'id': profile.email } }
			}, {
				username: profile.username,
				lowercaseUsername: profile.username.toLowerCase()
			}, {
				upsert: false,
				returnNewDocument: true
			});
		} 
			
		return dbUser;
	}


  }
};


