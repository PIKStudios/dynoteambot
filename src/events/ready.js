const { ActivityType } = require('discord.js');
const cowsay = require('cowsay');
const mongoose = require('mongoose');
const mongoURL = process.env.mongoURL;

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        
        client.user.setActivity({
            name: `your tickets 🦖`,
            type: ActivityType.Listening
        });

        console.log(cowsay.say({
            text : `Gata serif!`,
            f: `bishop`
        }));

        if (!mongoURL) return;

        await mongoose.connect(mongoURL || '', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        if (mongoose.connect) {
            console.log('Conectat serif si la baza');
        } else {
            console.log('Serif la baza n-am reusit...');
        }

    },
};