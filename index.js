const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder, Guild } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});
//VOCÊ TEM QUE TENTAR SOZINHO, DEPOIS PESQUISA.
const TOKEN = 'MTM3ODExNDMwMTM5ODYxODIyNg.Guf3xh.IkLYKPIaAnJl4xgaKvaf9rcvsN2n5vDntoyYPw';

client.on('guildMemberAdd', member => {
    let canal = member.guild.channels.cache.get("1378102192741027961")
    canal.send(`Oláaaa, ${member.id}. Já somos ${member.guild.memberCount}`)
})

client.once('ready', () => {
    console.log(`✅ Bot está online como ${client.user.tag}`);
});

let cargos = ["1378213317612404797", "1378205981095362601"]

let prefixo = '!'

client.on('messageCreate', async message => {
    if (message.content === `${prefixo}ping`) {
        let msg = await message.channel.send("Pong!")
        setTimeout(() => {
            msg.delete()
        }, 5000)
    }
    else if (message.content === `${prefixo}adm`) {
        message.reply("Olá, Adm.")
    }
    else if (message.content === `${prefixo}limpar`) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply("Você não tem permissão para fazer isso!")
        }
        if (!message.guild.members.me.permissionsIn(message.channel).has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('❌ Eu não tenho permissão para apagar mensagens nesse canal.');
        } try {
            const listaMensagens = await message.channel.messages.fetch({ limit: 100 })
            await message.channel.bulkDelete(listaMensagens, true)
            let msg = new EmbedBuilder().setTitle("Aviso!").setDescription(`Mensagens apagadas por @${message.member.displayName}`)
            let valor = await message.channel.send({ embeds: [msg] })

            setTimeout(() => {
                valor.delete().catch(() => { })
            }, 5000)

        } catch (error) {
            let msg = await message.channel.send("Ocorreu algum erro ao apagar!")
            setTimeout(() => {
                msg.delete().catch(() => { })
            }, 5000)
        }
    } else if (message.content.startsWith(`${prefixo}ban`)) {
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply("❌ Eu não tenho permissão para banir membros.");
        }

        const executor = message.member;
        const usuario = message.mentions.members.first();

        if (!usuario) {
            return message.reply("❌ Mencione alguém que esteja no servidor.");
        }

        if (cargos.some(id => executor.roles.cache.has(id)) || executor.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            message.reply("tentando banir " + usuario.user.tag)
            await usuario.ban({ reason: `Banido por ${executor.user.tag}` });
            message.channel.send(`✅ ${usuario.user.tag} foi banido com sucesso.`);
        }

        if (!executor.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply("❌ Você não tem permissão para banir membros.");
        }

    }

});

client.login(TOKEN);
