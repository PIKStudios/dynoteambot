const { SlashCommandBuilder , EmbedBuilder, PermissionsBitField } = require('discord.js')

module.exports = {

    data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a member from the guild')
    .addUserOption(option => option.setName('user').setDescription('The user you want to be unbanned').setRequired(true)),

    async execute(interaction, client) {

        const userId = interaction.options.getUser('user');

        if(!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return await interaction.reply({ content: `You do not have permission to use this commnad`, ephemeral: true })
        if(interaction.member.id === userId) return await interaction.reply({ content: "You cannot unban yourse3lf!", ephemeral: true});

        const embed = new EmbedBuilder()
        .setColor("#0D1D56")
        .setDescription(` :white_check_mark: <@${userId}> has been unbanned`)
        .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` });


        await interaction.guild.bans.fetch()
        .then(async bans => {

                if (bans.size == 0) return await interaction.reply({ content: "There is no one banned from this guild", ephemeral: true})
                let bannedID = bans.find(ban => ban.user.id == userId);
                if (!bannedID) return await interaction.reply({ content: "The ID stated is not banned from this server", ephemeral: true})

                await interaction.guild.bans.remove(userId).catch(err => {
                    return interaction.reply ({content: "I cannot unban this user"})
                })
        })

        await interaction.reply({ embeds: [embed] });
    }
}