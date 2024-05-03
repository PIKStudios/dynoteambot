const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, ChannelType, EmbedBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, } = require('discord.js');
const sugSchema = require('../Schemas/sugSchema');
const suggSchema = require('../Schemas/suggSchema');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isButton()) return;

        const member = interaction.user

        

        if(interaction.customId == 'accsug') {
            if (interaction.member.roles.cache.has("1232394080361906247")) {
                const data = await sugSchema.findOne({ Guild: interaction.guild.id });
                const channelID = data.Channel;
                const channel = interaction.guild.channels.cache.get(channelID);
                const description = interaction.message.embeds[0].fields[0].value;

                const embed = new EmbedBuilder()
                    .setColor('#0D1D56')
                    .setDescription(`**Suggestion from **${member}`)
                    .addFields(
                        { name: "Suggestion", value: `${description}`, inline: true },
                        { name: "Status", value: "Accepted", inline: true },
                    )
                    .setFooter({  text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}`})
                    .setTimestamp();

                const embed2 = new EmbedBuilder()
                    .setColor('#0D1D56')
                    .setDescription(`Your suggestion got **Accepted**`)
                    .addFields(
                        { name: "Suggestion", value: `${description}`, inline: true },
                    )
                    .setFooter({  text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}`})
                    .setTimestamp();

                channel.send({ embeds: [embed] });
                member.send({ embeds: [embed2] });



                await interaction.message.edit({ components: [] });
                await interaction.update({ content: '**Suggestion accepted!**', embeds: [], components: [] });
            } else if (!interaction.member.roles.cache.has("1232394080361906247")) {
                await interaction.reply({ content: `You do not have acces to use this button!`, ephemeral: true});
            }
        }

        if(interaction.customId == 'decsug') {
            if (interaction.member.roles.cache.has("1232394080361906247")) {
                const data = await sugSchema.findOne({ Guild: interaction.guild.id });
                const channelID = data.Channel;
                const channel = interaction.guild.channels.cache.get(channelID);
                const description = interaction.message.embeds[0].fields[0].value;

                const embed = new EmbedBuilder()
                    .setColor('#0D1D56')
                    .setDescription(`**Suggestion from **${member}`)
                    .addFields(
                        { name: "Suggestion", value: `${description}`, inline: true },
                        { name: "Status", value: "Declined", inline: true },
                    )
                    .setFooter({  text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}`})
                    .setTimestamp();

                channel.send({ embeds: [embed] });

                await interaction.message.edit({ components: [] });
                await interaction.update({ content: '**Suggestion declined!**', embeds: [], components: [] });
            } else if (!interaction.member.roles.cache.has("1232394080361906247")) {
                await interaction.reply({ content: `You do not have acces to use this button!`, ephemeral: true});
            }
        }
    }
}