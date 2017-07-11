const BeamClient = require('beam-client-node');
const BeamSocket = require('beam-client-node/lib/ws');

let userInfo;

const client = new BeamClient();

// With OAuth we don't need to login, the OAuth Provider will attach
// the required information to all of our requests after this call.
client.use('oauth', {
    tokens: {
        access: 'k7fotU53BN2J1bsgo3iZfK2hZGAG9xUxubtS7gTDdcslK9NLjzcChuVifaEFuDsZ',
        expires: Date.now() + (365 * 24 * 60 * 60 * 1000)
		
    },
});

// Get's the user we have access to with the token
client.request('GET', `users/current`)
.then(response => {
    userInfo = response.body;
    return client.chat.join(response.body.channel.id);
})
.then(response => {
    const body = response.body;
    return createChatSocket(userInfo.id, userInfo.channel.id, body.endpoints, body.authkey);
})
.catch(error => {
    console.log('Something went wrong:', error);
});

/**
 * Creates a beam chat socket and sets up listeners to various chat events.
 * @param {number} userId The user to authenticate as
 * @param {number} channelId The channel id to join
 * @param {any} endpoints An endpoints array from a beam.chat.join call.
 * @param {any} authkey An authentication key from a beam.chat.join call.
 * @returns {Promise.<>}
 */
function createChatSocket (userId, channelId, endpoints, authkey) {
	console.log('Socket is being made');
    // Chat connection
    const socket = new BeamSocket(endpoints).boot();
	var number = 0;
    // Greet a joined user
    socket.on('UserJoin', data => {
        socket.call('msg', [`Hi @${data.username}! Welcome to CombatXB's channel! Say !help for chat commands`]);
		
		number++;
		//socket.call('msg', ['This is CombatXB channel, Welcome! Check out my Youtube account: COMBATXB and follow me on Mixer']);
		console.log(number);
    });
	
    // React to command
    socket.on('ChatMessage', data => {
        if (data.message.message[0].data.toLowerCase().startsWith('!ping')) {
            socket.call('msg', [`@${data.user_name} PONG!`]);
            console.log(`Ponged ${data.user_name}`);
        }
		if(data.message.message[0].data.toLowerCase().startsWith('!intro')) {
	
			socket.call('msg', [`This is CombatXB channel, Welcome! Check out my Youtube account: COMBATXB and follow me on Mixer`]);
			console.log('an intro was called');
		}
		if(data.message.message[0].data.toLowerCase().startsWith('!night')) {
	
			socket.call('msg', [`@${data.user_name} is leaving. Peace out CombatXB`]);
			console.log('a user has left a stream');
			number--;
			console.log(number);
		}
		if(data.message.message[0].data.toLowerCase().startsWith('!games')) {
			socket.call('msg', [`Games that I stream:
			Gears of War 4 / Culling / GTAV / Battlefield 1
			/ Overwatch / Add a preference`]);
		}
		if(data.message.message[0].data.toLowerCase().startsWith('!help')) {
			socket.call('msg', [`-!ping(fun) / !intro(channel info)'
			/ !games(streaming list) / !time(stream times) /!night(saying goodnight)`]);
		}
		if(data.message.message[0].data.toLowerCase().startsWith('!time')) {
			socket.call('msg', [`The times for my stream are to be set soon!`]);
		}
		
		//Can add more statements here 
		//alerts you for information on your chat 
		//maybe through phone that you get a message 
		//or something else
		
    });
    // Handle errors
    socket.on('error', error => {
        console.error('Socket error', error);
    });
    return socket.auth(channelId, userId, authkey)
    .then(() => {
        console.log('Login successful');
        return socket.call('msg', [`Welcome to CombatXB channel! Say !help for chat commands`]);
    });
}