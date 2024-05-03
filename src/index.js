const { ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonStyle, Events, AttachmentBuilder, ActionRowBuilder, Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection } = require(`discord.js`);
const fs = require('fs');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions] }); 

client.commands = new Collection();

require('dotenv').config();

const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

(async () => {
    for (file of functions) {
        require(`./functions/${file}`)(client);
    }
    client.handleEvents(eventFiles, "./src/events");
    client.handleCommands(commandFolders, "./src/commands");
    client.login(process.env.token)
})();


// Giveaway
const GiveawaysManager = require('./giveaways');
client.giveawayManager = new GiveawaysManager(client, {
    default: {
        botsCanWin: false,
        embedColor: '#0D1D56',
        embedColorEnd: "#0D1D56",
        reaction: `🎉`,
    },
})


// Verify
const capschema = require('./Schemas/verify');
const verifyusers = require('./Schemas/verifyusers');
const LeftUsers = require('./Schemas/leavedusers')
const { CaptchaGenerator } = require('captcha-canvas');
const { createCanvas } = require('canvas');

client.on(Events.InteractionCreate, async interaction => {
        try {

        if (interaction.customId === 'verify') {
 
        if (interaction.guild === null) return;
     
        const verifydata = await capschema.findOne({ Guild: interaction.guild.id });
        const verifyusersdata = await verifyusers.findOne({ Guild: interaction.guild.id, User: interaction.user.id });
     
            if (!verifydata) return await interaction.reply({ content: `The **verification system** has been disabled in this server!`, ephemeral: true});
     
            if (verifydata.Verified.includes(interaction.user.id)) return await interaction.reply({ content: 'You have **already** been verified!', ephemeral: true});
     
                // let letter = ['0','1','2','3','4','5','6','7','8','9','a','A','b','B','c','C','d','D','e','E','f','F','g','G','h','H','i','I','j','J','f','F','l','L','m','M','n','N','o','O','p','P','q','Q','r','R','s','S','t','T','u','U','v','V','w','W','x','X','y','Y','z','Z',]
                // let result = Math.floor(Math.random() * letter.length);
                // let result2 = Math.floor(Math.random() * letter.length);
                // let result3 = Math.floor(Math.random() * letter.length);
                // let result4 = Math.floor(Math.random() * letter.length);
                // let result5 = Math.floor(Math.random() * letter.length);
     
                // const cap = letter[result] + letter[result2] + letter[result3] + letter[result4] + letter[result5];
     
                // const captcha = new CaptchaGenerator()
                // .setDimension(150, 450)
                // .setCaptcha({ font: "Calibri", text: `${cap}`, size: 60, color: "red"})
                // .setDecoy({ opacity: 0.5 })
                // .setTrace({ color: "red" })
     
                // const buffer = captcha.generateSync();
     
                // const verifyattachment = new AttachmentBuilder(buffer, { name: `captcha.png`});

                // Function to generate a random string for the captcha

function generateCaptcha(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let captcha = '';
    for (let i = 0; i < length; i++) {
        captcha += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return captcha;
}

// Function to generate the captcha image
async function generateCaptchaImage(text) {
    const canvas = createCanvas(450,150);
    const ctx = canvas.getContext('2d');

    // Background Color
    // ctx.fillStyle = '#FFFFFF';
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // TextColor
    ctx.fillStyle = '#FF0000'; // Red Color
    ctx.font = 'bold 100px Arial'; // first is the bold, px is the size of the text, and Arial is the text Type.
    ctx.textAlign = 'center'; // Center the text horizontally
    ctx.textBaseline = 'middle'; // Center the text vertically
    ctx.fillText(text, canvas.width / 2, canvas.height / 2); // Place the text in the center of the canvas

    return canvas.toBuffer();
}

// Example of how you could use the functions
const captchaText = generateCaptcha(5); // Generate a captcha with a length of 5 characters
generateCaptchaImage(captchaText)
    .then(async (buffer) => {
        const attachment = new AttachmentBuilder(buffer, { name: `captcha.png`});
        const verifyembed = new EmbedBuilder()
        .setColor('#0D1D56')
        .setAuthor({ name: `✅ Verification Proccess`})
        .setFooter({ text: `✅ Verification Captcha`})
        .setTimestamp()
        .setImage('attachment://captcha.png')
        .setTitle('> Verification Step: Captcha')
        .setDescription(`• Verify value:\n> Please use the button bellow to \n> submit your captcha!`)
     
                const verifybutton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setLabel('✅ Enter Captcha')
                    .setStyle(ButtonStyle.Success)
                    .setCustomId('captchaenter')
                )

                await interaction.reply({ embeds: [verifyembed], components: [verifybutton], files: [attachment], ephemeral: true });
     
                if (verifyusersdata) {
     
                    await verifyusers.deleteMany({
                        Guild: interaction.guild.id,
                        User: interaction.user.id
                    })
     
                    await verifyusers.create ({
                        Guild: interaction.guild.id,
                        User: interaction.user.id,
                        Key: captchaText
                    })
     
                } else {
     
                    await verifyusers.create ({
                        Guild: interaction.guild.id,
                        User: interaction.user.id,
                        Key: captchaText
                    })
     
                }
    })
    .catch(error => {
        console.error('An error occurred while generating the captcha:', error);
    });
     
            } else if (interaction.customId === 'captchaenter') {

                const vermodal = new ModalBuilder()
                    .setTitle(`Verification`)
                    .setCustomId('vermodal')
         
                    const answer = new TextInputBuilder()
                    .setCustomId('answer')
                    .setRequired(true)
                    .setLabel(`• Please sumbit your Captcha code`)
                    .setPlaceholder(`Your captcha code input`)
                    .setStyle(TextInputStyle.Short)
         
                    const vermodalrow = new ActionRowBuilder().addComponents(answer);
                    vermodal.addComponents(vermodalrow);
    
                await interaction.showModal(vermodal);

            } else if (interaction.customId === 'vermodal') {

                if (!interaction.isModalSubmit()) return;
         
                const userverdata = await verifyusers.findOne({ Guild: interaction.guild.id, User: interaction.user.id });
                const verificationdata = await capschema.findOne({ Guild: interaction.guild.id });
         
                if (verificationdata.Verified.includes(interaction.user.id)) return await interaction.reply({ content: `You have **already** verified within this server!`, ephemeral: true});
         
                const modalanswer = interaction.fields.getTextInputValue('answer');
                if (modalanswer === userverdata.Key) {
         
                    const verrole = interaction.guild.roles.cache.get(verificationdata.Role);
         
                    try {
                        await interaction.member.roles.add(verrole);
                    } catch (err) {
                        return await interaction.reply({ content: `There was an **issue** giving you the **<@&${verificationdata.Role}>** role, try again later!`, ephemeral: true})
                    }
         
                    await capschema.updateOne({ Guild: interaction.guild.id }, { $push: { Verified: interaction.user.id }});
                    const channelLog = interaction.guild.channels.cache.get("Your Channel ID");
                    if (!channelLog) {
                        await interaction.reply({ content: 'You have been **verified!**', ephemeral: true});
                        return;
                    } else {
                     const channelLogEmbed = new EmbedBuilder()
                     .setColor(`#0D1D56`)
                     .setTitle('⚠️ Someone verified to the server! ⚠️')
                     .setDescription(`<@${interaction.user.id}> Is been verified to the server!`)
                     .setTimestamp()
                     .setFooter({ text: `Verified Logs` })

                     await channelLog.send({ embeds: [channelLogEmbed] });
                     await interaction.reply({ content: 'You have been **verified!**', ephemeral: true});
                    }
         
                } else {
                    const channelLog = interaction.guild.channels.cache.get("Your Channel ID");
                    if (!channelLog) { 
                        await interaction.reply({ content: `**Oops!** It looks like you **didn't** enter the valid **captcha code**!`, ephemeral: true})
                        return;
                    } else {
                     const channelLogEmbed = new EmbedBuilder()
                     .setColor(`Red`)
                     .setTitle('⚠️ Watch out for a wrong verify attempt! ⚠️')
                     .setDescription(`<@${interaction.user.id}> Tries a code from the captcha but he failed, It was the wrong one, Take a look at the person maybe he has troubles when entering the code.\n\nMaybe its a bot so keep a eye on him!`)
                     .setTimestamp()
                     .setFooter({ text: `Verified Logs` })

                     await channelLog.send({ embeds: [channelLogEmbed] });
                     await interaction.reply({ content: `**Oops!** It looks like you **didn't** enter the valid **captcha code**!`, ephemeral: true})
                    }
                }

            }

            } catch (err) {
                console.error(err)
            }  
    });

// Or save it, Or this is also optional to just delete the Data from the database so they need to verify again But make sure to command the other 2 the one that saves the data.
// So here we delete the data once he left the server.
client.on('guildMemberRemove', async member => {
    try {
        const userId = member.user.id;
        
        // Check if the user was verified
        const userverdata = await verifyusers.findOne({ Guild: member.guild.id, User: userId });
        const verificationdata = await capschema.findOne({ Guild: member.guild.id });
        if (userverdata && verificationdata) {
            await capschema.updateOne({ Guild: member.guild.id },{ $pull: { Verified: userId } });
            await verifyusers.deleteOne({ Guild: member.guild.id, User: userId });
            // Now if the user left the server All the data was saved from the person is deleted!
        }
    } catch (err) {
        console.error(err);
    }
    // If there is a error console will tell you
});



