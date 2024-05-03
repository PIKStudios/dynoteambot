const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, ChannelType, EmbedBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, Embed, } = require('discord.js');
const ticket = require('../Schemas/ticketSchema');
const { createTranscript } = require('discord-html-transcripts');

module.exports = {

    name: 'interactionCreate',
    async execute(interaction, channel) {
        if (interaction.customId == 'ticketCreateSelect') {
            const modal = new ModalBuilder()
                .setTitle("Create your ticket")
                .setCustomId('ticketModal')
            const why = new TextInputBuilder()
                .setCustomId('whyTicket')
                .setRequired(true)
                .setPlaceholder('What is the reason for creating this ticket')
                .setLabel('Why are you creating this ticket?')
                .setStyle(TextInputStyle.Paragraph);
            const info = new TextInputBuilder()
                .setCustomId('infoTicket')
                .setRequired(false)
                .setPlaceholder('Feel free to leave this blank')
                .setLabel('Provide us with any additional information')
                .setStyle(TextInputStyle. Paragraph);
            
            const one = new ActionRowBuilder().addComponents(why);
            const two = new ActionRowBuilder().addComponents (info);

            modal.addComponents(one, two);
            await interaction.showModal(modal);
        } else if (interaction.customId == 'ticketModal') {
            const user = interaction.user;
            const data = await ticket.findOne({ Guild: interaction.guild.id });
            if (!data) return await interaction.reply({ content: `Sorry! Looks like you found this message but the ticket system is not yet setup here.`, ephemeral: true });
            else {
                const why = interaction.fields.getTextInputValue('whyTicket');
                const info = interaction.fields.getTextInputValue('infoTicket');
                const category = await interaction.guild.channels.cache.get(data.Category);

                const channel = await interaction.guild.channels.create({
                    name: `ticket-${user.id}`,
                    type: ChannelType.GuildText,
                    topic: `Ticket user: ${user.username}; Ticket reason: ${why}`,
                    parent: category,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField. Flags.ViewChannel]
                        },
                        {
                            id: interaction.user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]
                        },
                        {
                            id: '1232394157184647270',
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]
                        }
                    ]
                });

                const embed = new EmbedBuilder()
                    .setColor("#0D1D56")
                    .setTitle(`Ticket from ${user.username}`)
                    .setDescription(`Opening Reason: ${why}\n\nExtra Information: ${info}`)
                    .setTimestamp();
                const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('closeTicket')
                    .setLabel('🔒 | Close Ticket')
                    .setStyle(ButtonStyle. Danger)
                )

                await channel.send({ embeds: [embed], components: [button] });
                await interaction.reply({ content: `Your ticket has been opened in ${channel}`, ephemeral: true });
            }
        } else if (interaction.customId == 'closeTicket') {
            const closeModal = new ModalBuilder()
            .setTitle('Ticket Closing')
            .setCustomId('closeTicketModal')
            const reason = new TextInputBuilder()
            .setCustomId('closeReasonTicket')
            .setRequired(true)
            .setPlaceholder('What is the reason for closing this ticket?')
            .setLabel('Provide a closing reason')
            .setStyle(TextInputStyle. Paragraph);
            const one = new ActionRowBuilder().addComponents (reason);
            closeModal.addComponents (one);
            await interaction.showModal (closeModal);
        } else if (interaction.customId == 'closeTicketModal') {
            var channel = interaction.channel;
            var name = channel.name;
            name = interaction.name.replace('ticket-', 'closed-');
            const member = await interaction.guild.members.cache.get(name);
            const reason = interaction.fields.getTextInputValue('closeReasonTicket');
            await interaction.reply({ content: `🔒 | Closing this ticket...` }); 
            await channel.permissionOverwrites.set([
                {
                    id: interaction.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: interaction.user.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: '1232394157184647270',
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]
                }
            ]);
            setTimeout(async () => {

                const embed2 = new EmbedBuilder()
                .setColor("#0D1D56")
                .setTitle("👷 | Support Team Control Panel")
                .setDescription(`🎫 | Here you can see the ** Support Team Control Panel **`)
                .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })

                const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('deltk')
                    .setLabel('🗑️ | Delete Ticket')
                    .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                    .setCustomId('transtk')
                    .setLabel('📜 | Create Transcript')
                    .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                    .setCustomId('reopntk')
                    .setLabel('🔓 | Reopen Ticket')
                    .setStyle(ButtonStyle.Success)
                )

                const file = await createTranscript(interaction.channel, {
                    limit: -1,
                    returnBuffer: false,
                    filename: `${interaction.channel.name}.html`
                });

                var msg = await interaction.channel.send({ conetnt: `🦖 Your transcript cache:`, files: [file] });
                await msg.delete()

                await interaction.editReply({ content: ` `, embeds: [embed2], components: [button] });
                // await channel.delete().catch(err => {});
                const embed3 = new EmbedBuilder()
                    .setColor("#0D1D56")
                    .setTitle("🔒 | Ticket Closed")
                    .setDescription(`🎫 | You ticket has been **closed**. \nReason: **${reason}**\n Transcript: **[Direct Link](https://mahto.id/chat-exporter?url=${msg.attachments.first()?.url})**`)
                    .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` });
                await interaction.member.send({ embeds: [embed3] }).catch(err => {});
            }, 5000)
        } else if (interaction.customId == 'deltk') {
            var channel = interaction.channel;

            const embed4 = new EmbedBuilder()
            .setColor("#0D1D56")
            .setTitle("🗑️ | Deleting this Ticket")
            .setDescription(`🎫 | This ticket will be deleted in ** 10 seconds**`)
            .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })

            await interaction.reply({ embeds: [embed4] });
            setTimeout(async () => {
                await channel.delete().catch(err => {});
            }, 10000)
        } else if (interaction.customId == 'transtk') {
            const file = await createTranscript(interaction.channel, {
                limit: -1,
                returnBuffer: false,
                filename: `${interaction.channel.name}.html`
            });
            var channel = interaction.channel;
            var name = channel.name;
            const member = await interaction.guild.members.cache.get(name);
            const user = interaction.user;

            const chanID = '1232028031829282997';
            const tChannel = await interaction.guild.channels.cache.get(chanID);

            // Message
            var msg = await interaction.channel.send({ content: `🦖 Your transcript cache:`, files: [file] });
            // var message = `🦖 **Here is your [ticket transcript](https://mahto.id/chat-exporter?url=${msg.attachments.first()?.url}) from ${interaction.guild.name}!**`;


            /* const transEmbed = new EmbedBuilder()
                .setColor("#0D1D56")
                .setTitle("📜 | Ticket Transcript")
                .setDescription(`🎫 | Here is your ticket transcript: **[Direct Link](https://mahto.id/chat-exporter?url=${msg.attachments.first()?.url})**`)
                .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` }); */


            const AdmTEmbed = new EmbedBuilder()
                .setColor("#0D1D56")
                .setTitle("📜 | Transcript")
                .setDescription(`🎫 | Here is ${user.username} ticket transcript: **[Direct Link](https://mahto.id/chat-exporter?url=${msg.attachments.first()?.url})**`)
                .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` });

            //Send

            await msg.delete()
            await interaction.reply({ content: `🦖 | I have sent the ticket transcrip into ${user.username} DMs and <#${chanID}> !`});

            await interaction.member.send({ embeds: [transEmbed] }).catch(err => {});

            await tChannel.send({ embeds: [AdmTEmbed] }).catch(err => {});
        } else if (interaction.customId == 'reopntk') {
            var channel = interaction.channel;
            const member = await interaction.guild.members.cache.get(name);
            await interaction.reply({ content: `🔓 | Reopening this ticket...` }); 
            setTimeout(async () => {
                await channel.permissionOverwrites.set([
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel,  PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory], 
                    },
                    {
                        id: '1232394157184647270',
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]
                    }
                ]);
                
                const embed5 = new EmbedBuilder()
                .setColor("#0D1D56")
                .setTitle("🔓 | Ticket Reopened")
                .setDescription(`🎫 | You ticket has been **unlocked**. Check it ${channel}`)
                .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` });

                await interaction.member.send({ embeds: [embed5] }).catch(err => {});
            }, 5000)
        }   
    }
}