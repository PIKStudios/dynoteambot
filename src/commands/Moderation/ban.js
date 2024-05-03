const { SlashCommandBuilder , EmbedBuilder, PermissionsBitField } = require('discord.js')

module.exports = {

    data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the guild')
    .addUserOption(option => option.setName('user').setDescription('The user you want banned').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('The reason you want this person banned').setRequired(false)),

    async execute(interaction, client) {

        const users = interaction.options.getUser('user');
        const ID = users.id;
        const banUser = client.users.cache.get(ID)

        if(!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return await interaction.reply({ content: `You do not have permission to use this commnad`, ephemeral: true })
        if(interaction.member.id === ID) return await interaction.reply({ content: "You cannot ban yourself!", ephemeral: true});

        let reason = interaction.options.getString('reason');
        if (!reason) reason = "No reason given";

        const dnEmbed = new EmbedBuilder()
        .setColor("#0D1D56")
        .setDescription(`:white_check_mark: You have been banned from **${interaction.guild.name}** | ${reason}`)
        .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` });

        const embed = new EmbedBuilder()
        .setColor("#0D1D56")
        .setDescription(` :white_check_mark: ${banUser.tag} has been banned | **${reason}**`)
        .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })


        await interaction.guild.bans.create(banUser.id, {reason}).catch(err => {
            return interaction.reply({ content: "I cannot ban this member!", ephemeral: true})
        })
        await banUser.send({ embeds: [dnEmbed] }).catch(err => {
            return;
        })

        await interaction.reply ({ embeds: [embed] });
    }
}