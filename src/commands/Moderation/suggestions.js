const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const sugSchema = require('../../Schemas/sugSchema');
const suggSchema = require('../../Schemas/suggSchema');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('suggestion')
    .setDescription('A review command')
    .addSubcommand(command => command.setName('setup').setDescription('Setup the suggestions system').addChannelOption(option => option.setName('channel').setDescription('The channel where the reviews will be posted').setRequired(true)))
    .addSubcommand(command => command.setName('disable').setDescription('Disable the suggestions system'))
    .addSubcommand(command => command.setName('leave').setDescription('Leave a suggestion').addStringOption(option => option.setName('suggestion').setDescription('Your suggestion').setRequired(true))),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const data = await sugSchema.findOne({ Guild: interaction.guild.id});

        switch(sub) {
            case 'setup':

                if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply ({ content: `⛔ | You don't have permision to setup the suggestion system`, ephemeral: true })
                if(data) return await interaction.reply({ content: `❌ | You have already set up the system!`, ephemeral: true })
                else {
                    const channel = interaction.options.getChannel('channel')

                    await sugSchema.create({
                        Guild: interaction.guild.id,
                        Channel: channel.id
                    });

                    await interaction.reply({ content: `✅ | Suggestions system has been set up`, ephemeral: true})
                }
            break;

            case 'disable':
                if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply ({ content: `⛔ | You dont' have permision to setup the suggestions system`, ephemeral: true })
                if(!data) return await interaction.reply({ content: `❌ | You haven't set up the system!`, ephemeral: true})

                else {
                    await sugSchema.deleteOne({ Guild: interaction.guild.id });
                    await interaction.reply({ content: `✅ | Suggestions system has been disabled.`, ephemeral: true });
                }
                
            break;

            case 'leave':
                
                if (!data) return await interaction.reply({ content: `❌ | The suggestions system hasn't been set up! `, ephemeral: true });
                else if (data) {

                    const channelID = data.Channel;
                    const description = interaction.options.getString("suggestion");
                    const channel = interaction.guild.channels.cache.get(channelID);
                    const member = interaction.user


                    const button = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId('accsug')
                        .setLabel('✅ | Accept')
                        .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                        .setCustomId('decsug')
                        .setLabel('❌ | Decline')
                        .setStyle(ButtonStyle.Danger)
                    )

                    const embed1 = new EmbedBuilder()
                    .setColor('#0D1D56')
                    .setDescription(`**Suggestion from **${member}`)
                    .addFields(
                        { name: "Suggestion", value: `${description}`, inline: true },
                        { name: "Status", value: `Pending...`, inline: true},
                        )
                    .setFooter({  text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}`})
                    .setTimestamp()
    
                    const embed2 = new EmbedBuilder()
                    .setColor('#0D1D56')
                    .setDescription(`Your suggestion was succesfully sent in ${channel}`)
                    .setFooter({  text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
                    .setTimestamp()
    
                    channel.send({ embeds: [embed1], components: [button] });

                    const msgid = interaction.message.id
                    
                    await suggSchema.create({
                        Server: interaction.guild.id,
                        User: interaction.user.id,
                        Suggestion: description,
                        SuggestionID: msgid,
                    });


                    return interaction.reply({ embeds: [embed2], ephemeral: true });

                }
        }
    }
}