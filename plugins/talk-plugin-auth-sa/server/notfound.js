const UserModel = require('../../../models/user');

module.exports = { tokenUserNotFound: async ({jwt, token}) => {

    let profile = jwt;
	
	if( !profile || !profile.username || !profile.email )
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

		var dbUserUpdated = null;

		if( ( profile.subid && dbUser.id != profile.subid ) )
		{
			dbUserUpdated = await UserModel.findOneAndUpdate({
				'profiles': { $elemMatch: { 'id': profile.email } }
			}, {
				id: profile.subid
			}, {
				upsert: false,
				new: true
			});
		} 

		if ( profile.email && dbUser.profiles[0].id != profile.email ) 
		{
			dbUserUpdated = await UserModel.findOneAndUpdate({
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
				new: true
			});
		}

		if( profile.username && dbUser.username != profile.username )
		{
			dbUserUpdated = await UserModel.findOneAndUpdate({
				'profiles': { $elemMatch: { 'id': profile.email } }
			}, {
				username: profile.username,
				lowercaseUsername: profile.username.toLowerCase()
			}, {
				upsert: false,
				new: true
			});
		} 
		
		if( dbUserUpdated )
		{
			return dbUserUpdated;
		} else {
			return dbUser;
		}		
	}


  }
};


