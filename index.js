const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder, Guild } = require('discord.js');

const resetMensal = async () => {
    const agora = new Date();
    const month = agora.getMonth() + 1;
    const year = agora.getFullYear();

    const todos = await prisma.callTime.findMany();

    for (const user of todos) {
        await prisma.callTimeHistory.create({
            data: {
                userId: user.userId,
                totalMs: user.totalMs,
                month,
                year,
            }
        });

        await prisma.callTime.update({
            where: { userId: user.userId },
            data: { totalMs: BigInt(0) }
        });
    }

    console.log(`📆 Reset mensal realizado para ${month}/${year}`);
};

setInterval(async () => {
    const hoje = new Date();
    const dia = hoje.getDate();

    if (dia === 1 && hoje.getHours() === 0 && hoje.getMinutes() < 5) {
        await resetMensal();
    }
}, 60 * 1000);


const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates
    ]
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const callTime = new Map()

require('dotenv').config();
const TOKEN = process.env.TOKEN;

client.on('guildMemberAdd', member => {
    let canal = member.guild.channels.cache.get("1378102192741027961")
    canal.send(`Oláaaa, ${member.id}. Já somos ${member.guild.memberCount}`)
})
client.on("voiceStateUpdate", async (oldState, newState) => {

    const userId = newState.id;

    const entrou = !oldState.channelId && newState.channelId;
    const saiu = oldState.channelId && !newState.channelId;

    if (entrou) {
        callTime.set(userId, Date.now())
    }

    if (saiu && callTime.has(userId)) {
        const tempoEntrada = callTime.get(userId);
        const tempoEmCall = Date.now() - tempoEntrada;
        callTime.delete(userId);

        await prisma.callTime.upsert({
            where: { userId },
            update: { totalMs: { increment: BigInt(tempoEmCall) } },
            create: { userId, totalMs: BigInt(tempoEmCall) },
        });
    }
});

client.once('ready', () => {
    console.log(`✅ Bot está online como ${client.user.tag}`);
});

let cargos = ["1380386078804021369", "1380386202242388018"]

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
        const executor = message.member;

        if (cargos.some(id => executor.roles.cache.has(id)) || executor.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            try {
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
                    message.delete()
                    msg.delete().catch(() => { })
                }, 5000)
            }
        }

    }
    else if (message.content.startsWith(`${prefixo}mudarPrefixo`)) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply("❌ Você não tem permissão para mudar o prefixo.");
        }

        const novoPrefixo = message.content.slice(`${prefixo}mudarPrefixo`.length).trim();

        if (!novoPrefixo) {
            return message.reply("❗ Você precisa escrever o novo prefixo. Ex: `!mudarPrefixo ?`");
        }

        prefixo = novoPrefixo;

        message.channel.send(`✅ Prefixo alterado para: \`${prefixo}\``);
    }

    else if (message.content.startsWith(`${prefixo}ban`)) {
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
    else if (message.content === `${prefixo}perfil`) {

        let apelido = [
            "Lindo(a)",
            "Show",
            "Fortinho(a)",
            "Gatinho(a)",
            "Cheirosinho(a)",
            "Brabo(a)",
            "Charmoso(a)",
            "Estiloso(a)",
            "Mister Simpatia",
            "Rainha do Rolê",
            "Poderoso(a)",
            "Fofo(a)",
            "Encantador(a)",
            "Craque",
            "Topzera",
            "Maluco(a) beleza",
            "Masterchef das ideias",
            "Carismático(a)",
            "Ousado(a)",
            "Lendário(a)",
            "Mito(a)",
            "Rei/Rainha da zoeira",
            "Gênio incompreendido",
            "Capitão(a) do rolê"
        ];

        let gerarApelido = Math.round(Math.random() * apelido.length)

        const avatar = message.member.user.displayAvatarURL({ dynamic: true, size: 512 })
        let msg = new EmbedBuilder().setThumbnail(avatar).setTitle(message.member.user.displayName).setDescription(`Essa pessoa é ${apelido[gerarApelido]}`)
        let mandar = await message.channel.send({ embeds: [msg] })
        setTimeout(() => {
            mandar.delete()
            message.delete()
        }, 3000)
    }
    else if (message.content === `${prefixo}tempo`) {
        const userId = message.author.id;

        const dados = await prisma.callTime.findUnique({
            where: { userId },
        });

        if (!dados) {
            return message.reply("⏱️ Você ainda não tem tempo registrado em call.");
        }

        const totalMs = Number(dados.totalMs);
        const minutos = Math.floor(totalMs / 60000);
        const segundos = Math.floor((totalMs % 60000) / 1000);

        let msg = await message.reply(`🕒 Você passou ${minutos} minutos e ${segundos} segundos em call.`);
        setTimeout(() => {
            msg.delete()
            message.delete()
        }, 3000)
    }
    else if (message.content === `${prefixo}top5`) {
        const topUsers = await prisma.callTime.findMany({
            orderBy: { totalMs: 'desc' },
            take: 5,
        });

        if (topUsers.length === 0) {
            return message.reply('Ainda não há dados de call registrados.');
        }

        let ranking = topUsers
            .map((user, index) => {
                const minutos = Math.floor(Number(user.totalMs) / 60000);
                return `**${index + 1}.** <@${user.userId}> — ${minutos} minutos`;
            })
            .join('\n');

        let msg = await message.channel.send({
            content: `🏆 **Top 5 mais tempo em call:**\n\n${ranking}`,
            allowedMentions: { users: [] }
        });
        setTimeout(() => {
            msg.delete()
            message.delete()
        }, 5000)
    }
});

client.login(TOKEN);
