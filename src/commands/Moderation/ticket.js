const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ActionRowBuilder, StringSelectMenuBuilder, ChannelType } = require('discord.js');
const ticket = require('../../Schemas/ticketSchema');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Create a ticket panel')
    .addSubcommand(command => command.setName('send').setDescription('Sends the ticket panel').addStringOption(option => option.setName('name').setDescription('This is goin to be the title of the embed').setRequired(true)).addStringOption(option => option.setName('message').setDescription('This is going to be the message of the embed').setRequired(false)))
    .addSubcommand(command => command.setName('setup').setDescription('This setups the panel').addChannelOption(option => option.setName('category').setDescription('The tickets category').addChannelTypes(ChannelType.GuildCategory).setRequired(true)))
    .addSubcommand(command => command.setName('remove').setDescription('Remove the panel system'))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

    async execute( interaction, client) {
        
        const { options } = interaction;
        const sub = options.getSubcommand();
        const data = await ticket.findOne({ Guild: interaction.guild.id});

        switch(sub) {
            case 'send':
                if (!data) return await interaction.reply({ content: `⚠️ You have to do /ticket setup before this command`, ephemeral: true });

                const name = options.getString('name');
                var message = options.getString('message') || 'Create a ticket if you got any problems that our Support Team can help with';

                const select = new ActionRowBuilder()
                .addComponents(
                new StringSelectMenuBuilder()
                .setCustomId('ticketCreateSelect')
                .setPlaceholder ( `🦖 ${name}`)
                .setMinValues(1)
                .addOptions(
                    {
                        label: '⚠️ Script Support',
                        description: 'Click to begin the ticket creation process',
                        value: 'createTicket'
                    },
                    {
                        label: '🦖 PrePurchase Qustions',
                        description: 'Click to begin the ticket creation process',
                        value: 'pcreateTicket'
                    },
                )
            );

            const embed = new EmbedBuilder()
            .setColor("#0D1D56")
            .setTitle('🦖 Create a Ticket')
            .setDescription(message + ` 🎫`)
            .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` });

            await interaction.reply({ content: `🦖 I have sent your messaage below.`, ephemeral: true });
            await interaction.channel.send({ embeds: [embed], components: [select] });

        
        break;

        case 'remove':

            if (!data) return await interaction.reply({ content: `⚠️ Looks like you didn't set the bot!`, ephemeral: true });
            else {
                await ticket.deleteOne({ Guild: interaction.guild.id});
                await interaction.reply({ content: `I have deleted your ticket category.`, ephemeral: true });
            }

        break;

        case 'setup':

            if (data) return await interaction.reply({ content: `⚠️ Looks like you have already setup the bot! <#${data.Category}>`, ephemeral: true });
            else {
                const category = options.getChannel('category');
                await ticket.create({
                    Guild: interaction.guild.id,
                    Category: category.id
                });

                await interaction.reply({ content: `I have set up you Tciket panel to category ${category} !`, ephemeral: true });
            }
        }
    }
}