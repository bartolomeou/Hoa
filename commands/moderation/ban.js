const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder
} = require('discord.js');

module.exports = {
    category: 'moderation',
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Select a member and ban them.')
        .addUserOption((option) =>
            option
                .setName('target')
                .setDescription('The member to ban')
                .setRequired(true)
        )
        .addStringOption((option) =>
            option.setName('reason').setDescription('The reason for banning')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason =
            interaction.options.getString('reason') || 'No reason provided';

        const confirm = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Confirm Ban')
            .setStyle(ButtonStyle.Danger);

        const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(cancel, confirm);

        // store InteractionResponse as a variable
        const response = await interaction.reply({
            content: `Are you sure you want to ban ${target} for reason: ${reason}?`,
            components: [row]
        });

        const collectorFilter = (i) => i.user.id === interaction.user.id;

        try {
            // awaitMessageComponent returns a Promise that resolves when any interaction passes its filter, or throws if none are received before the timeout.
            const confirmation = await response.awaitMessageComponent({
                // only the user who triggered the original interaction can use the buttons
                filter: collectorFilter,
                time: 60000
            });

            if (confirmation.customId === 'confirm') {
                await interaction.guild.members.ban(target);
                await confirmation.update({
                    content: `${target.username} has been banned for reason: ${reason}`,
                    components: []
                });

                // for testing purpose
                setTimeout(() => {
                    guild.member.unban(user);
                }, 10000);
            } else if (confirmation.customId === 'cancel') {
                await confirmation.update({
                    content: 'Action cancelled',
                    components: []
                });
            }
        } catch (e) {
            await interaction.editReply({
                content:
                    'Confirmation not received within 1 minute, cancelling.',
                components: []
            });
        }
    }
};
