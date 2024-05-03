const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField} = require('discord.js');
const revSchema = require('../../Schemas/reviewSchema');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('review')
    .setDescription('A review command')
    .addSubcommand(command => command.setName('setup').setDescription('Setup the review system').addChannelOption(option => option.setName('channel').setDescription('The channel where the reviews will be posted').setRequired(true)))
    .addSubcommand(command => command.setName('disable').setDescription('Disable the review system'))
    .addSubcommand(command => command.setName('leave').setDescription('Leave a review to our server').addStringOption(option => option.setName('stars').setDescription('The number of starts you leave us').addChoices(
        { name: "⭐", value: "⭐" },
        { name: "⭐⭐", value: "⭐⭐" },
        { name: "⭐⭐⭐", value: "⭐⭐⭐" },
        { name: "⭐⭐⭐⭐", value: "⭐⭐⭐⭐" },
        { name: "⭐⭐⭐⭐⭐", value: "⭐⭐⭐⭐⭐" }
    ).setRequired(true)).addStringOption(option => option.setName('description').setDescription('If you want, you can leave a note').setRequired(false))),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const data = await revSchema.findOne({ Guild: interaction.guild.id});

        switch(sub) {
            case 'setup':

                if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply ({ content: `⛔ | You dont have permision to setup the review system`, ephemeral: true })
                if(data) return await interaction.reply({ content: `❌ | You have already set up the system!`, ephemeral: true })
                else {
                    const channel = interaction.options.getChannel('channel')

                    await revSchema.create({
                        Guild: interaction.guild.id,
                        Channel: channel.id
                    });

                    await interaction.reply({ content: `✅ | Review system has been set up`, ephemeral: true})
                }
            break;

            case 'disable':
                if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply ({ content: `⛔ | You dont have permision to setup the review system`, ephemeral: true })
                if(!data) return await interaction.reply({ content: `❌ | You have set up the system!`, ephemeral: true})

                else {
                    await revSchema.deleteOne({ Guild: interaction.guild.id });
                    await interaction.reply({ content: `✅ | Review system has been disabled.`, ephemeral: true });
                }
                
            break;

            case 'leave':
                
                if (!data) return await interaction.reply({ content: `❌ | The review system hasn't been set up! `, ephemeral: true });
                else if (data) {

                    const channelID = data.Channel;
                    const stars = interaction.options.getString("stars");
                    const description = interaction.options.getString("description");
                    const channel = interaction.guild.channels.cache.get(channelID);
                    const member = interaction.user.tag

                    const embed1 = new EmbedBuilder()
                    .setColor('#0D1D56')
                    .setDescription(`Review from ${member}`)
                    .addFields(
                        { name: "Stars", value: `${stars}`, inline: true },
                        { name: "Review", value: `${description}\n` },
                        )
                    .setFooter({  text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}`})
                    .setTimestamp()
    
                    const embed2 = new EmbedBuilder()
                    .setColor('#0D1D56')
                    .setDescription(`Your review was succesfully sent in ${channel}`)
                    .setFooter({  text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
                    .setTimestamp()
    
                    channel.send({ embeds: [embed1] });
                    
                    return interaction.reply({ embeds: [embed2], ephemeral: true });

                }
        }
    }
}