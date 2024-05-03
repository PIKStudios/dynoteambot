const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const ms = require('ms')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Start or configure a giveaway')
    .addSubcommand(command => command.setName('create').setDescription('Create a giveaway').addStringOption(option => option.setName('duration').setDescription('The duration of the giveaway').setRequired(true)).addIntegerOption(option => option.setName('winners').setDescription('How many winners should be picked').setRequired(true)).addStringOption(option => option.setName('prize').setDescription('The prize the winner gets').setRequired(true)).addChannelOption(option => option.setName('channel').setDescription('The channel where the embed should get sent').setRequired(false)).addStringOption(option => option.setName('content').setDescription('The content that will be used for the giveaway').setRequired(false)))
    .addSubcommand(command => command.setName('edit').setDescription('Edit an already made giveaway').addStringOption(option => option.setName('message-id').setDescription('The giveaway you want to edit Message ID').setRequired(true)).addStringOption(option => option.setName('time').setDescription('The added Giveaway duration in MS').setRequired(true)).addStringOption(option => option.setName('winners').setDescription('The updated number of winners').setRequired(true)).addStringOption(option => option.setName('prize').setDescription('The updated prize for the giveaway').setRequired(false)))
    .addSubcommand(command => command.setName('end').setDescription('End a giveaway').addStringOption(option => option.setName('message-id').setDescription('The giveaway message-id').setRequired(true)))
    .addSubcommand(command => command.setName('reroll').setDescription('Reroll a giveaway winner').addStringOption(option => option.setName('message-id').setDescription('The message ID of the giveaway').setRequired(true))),

    async execute(interaction, client) {
        
        if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply ({ content: `You dont have perms to manage giveaways`, ephemeral: true })
        const sub = interaction.options.getSubcommand();

        switch(sub) {
            case 'create':
                
                await interaction.reply({ content: `Starting you giveaway...`, ephemeral: true });

                const duration = ms(interaction.options.getString('duration') || "");
                const winnerCount = interaction.options.getInteger('winners');
                const prize = interaction.options.getString('prize');
                const contentmain = interaction.options.getString('content');
                const channel = interaction.options.getChannel('channel');
                const showChannel = interaction.options.getChannel('channel') || interaction.channel;
                if(!channel && !contentmain) 

                    client.giveawayManager.start(interaction.channel, {
                            prize,
                            winnerCount,
                            duration,
                            hostedBy: interaction.user,
                            lastChance: {
                                enabled: false,
                                content: contentmain,
                                threshold: 60000000000_000,
                                embedColor: '#0D1D56'
                        }
                    })
                else if (!channel)
                    client.giveawayManager.start(interaction.channel, {
                        prize,
                        winnerCount,
                        duration,
                        hostedBy: interaction.user,
                        lastChance: {
                            enabled: false,
                            content: contentmain,
                            threshold: 60000000000_000,
                            embedColor: '#0D1D56'
                        }
                    })
                else if (!contentmain)
                    client.giveawayManager.start(channel, {
                        prize,
                        winnerCount,
                        duration,
                        hostedBy: interaction.user,
                        lastChance: {
                            enabled: false,
                            content: contentmain,
                            threshold: 60000000000_000,
                            embedColor: '#0D1D56'
                        }
                    })
                else
                client.giveawayManager.start(channel, {
                    prize,
                    winnerCount,
                    duration,
                    hostedBy: interaction.user,
                    lastChance: {
                        enabled: true,
                        content: contentmain,
                        threshold: 60000000000_000,
                        embedColor: '#0D1D56'
                    }
                })

                interaction.editReply({ content: `You giveaway has been started! Check ${showChannel} for you giveaway`, ephemeral: true })

            break;
            
            case 'edit':
                await interaction.reply({ content: `Editing your giveaway...`, ephemeral: true});
                const newprize = interaction.options.getString('prize');
                const newduration = interaction.options.getString('time');
                const newwinners = interaction.options.getInteger('winners');
                const messageId = interaction.options.getString('message-id');
                client.giveawayManager.edit(messageId, {
                    addTime: ms(newduration),
                    newwinnerCount: newwinners,
                    newPrize: newprize
                }).then(() => {
                    interaction.editReply({ content: `Your giveaway has been edited!`, ephemeral: true});
                }).catch(err => {
                    interaction.editReply({ content: `There was an error while editing your giveaway!`, ephemeral: true});
                });
            
            break;
            
            case 'end':

                await interaction.reply({ content: `Ending your giveaway...`, ephemeral: true});

                const messageId1 = interaction.options.getString('message-id');

                client.giveawayManager.end(messageId1).then(()=> {
                    interaction.editReply({ content: `Your giveaway has been ended`, ephemeral: true});
                }).catch(err => {
                    interaction.editReply({ content: `An error occured while trying to end your giveaway`, ephemeral: true});
                });
            
            break;

            case 'reroll':

            await interaction.reply({ content: `Rerolling your giveaway...`, ephemeral: true});

            const query = interaction.options.getString('message-id');

            const giveaway = client.giveawayManager.giveaways.find((g) => g.guildId === interaction.guildId && g.prize === query) || client.giveawayManager.giveaways.find((g) => g.guildId === interaction.guildId && g.messageId === query)

            if (!giveaway) return interaction.editReply({ content: `I could not find a giveaway with the message ID you provided`, ephemeral: true});
                
                const messageId2 = interaction.options.getString('message-id');

            client.giveawayManager.reroll (messageId2).then(() => {
                interaction.editReply({ content: `Your giveaway has been rerolled`, ephemeral: true});
            }).catch(err => {
                interaction.editReply({ content: `There was an error trying to reroll your giveaway`, ephemeral: true})
            })

        }
    }   
}