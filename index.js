'use strict';

const Discord = require('discord.js');

const client = new Discord.Client();

const activities_list = [
  {
    type: 'WATCHING',
    label: 'os membros do servidor!'
  },
  {
    type: 'PLAYING',
    label: 'no servidor GEEK W0RLD!'
  },
  {
    type: 'LISTENING',
    label: 'o servidor  GEEK WORLD!'
  }
];

const generateEmbed = (
  user,
  author,
  reason,
  punishment
) => ({
  color: 0x00fff7,
  title: 'Comprovante de Punição',
  fields: [
    {
      name: 'Usuário Punido:',
      value: `${user}`,
      inline: true
    },
    {
      name: 'Punido por:',
      value: `${author}`,
      inline: true
    },
    {
      name: 'Motivo:',
      value: `${reason}`,
      inline: true
    },
    {
      name: 'Punição:',
      value: `${punishment}`,
      inline: true
    },
    {
      name: 'ATT:',
      value: 'GeekBOT',
      inline: true
    }
  ],
  timestamp: new Date(),
});

const generateNewMemberEmbed = (member, avatar) => ({
  color: 0x00fff7,
  description: `${member} | Bem-vindo(a)!`,
  fields: [
    {
      name: 'Olá, seja bem-vindo(a) ao GEEK WORLD!',
      value: '------------------------------'
    },
    {
      name: ':name_badge: Precisando de ajuda?',
      value: 'Caso você tenha alguma dúvida ou problema, abra um ticket no canal de suporte!'
    },
    {
      name: ':police_officer: Evite punições!',
      value: 'Leia as nossas #:page_with_curl:regras para evitar ser punido no servidor!'
    }
  ],
  timestamp: new Date(),
  thumbnail: {
    url: avatar
  },
  image: {
    url: 'https://ygorlf.github.io/geekBOT/welcome.png'
  }
});

const generateRemoveMemberEmbed = (member) => ({
  color: 0x00fff7,
  description: `${member}`,
  fields: [
    {
      name: ':sob: #chateado!',
      value: `:coffin: ${member} saiu do servidor :disappointed_relieved:`
    },
  ],
  timestamp: new Date(),
});

client.on('ready', (ev) => {
  setInterval(async() => {
    const index = Math.floor(Math.random() * (activities_list.length - 1) + 1); // generates a random number between 1 and the length of the activities array list (in this case 5).
    await client.user.setActivity(activities_list[index].label, { type: activities_list[index].type }); // sets bot's activities to one of the phrases in the arraylist.
  }, 10000);

  client.on('guildMemberAdd', member => {
    const name = member.user.username;
    const channel = client.channels.cache.get(`${process.env.WELCOME_CHANNEL_ID}`);

    channel.send({
      embed: generateNewMemberEmbed(name, member.user.displayAvatarURL())
    }); 
  });

  client.on('guildMemberRemove', member => {
    const name = member.user.username;
    const channel = client.channels.cache.get(`${process.env.EXIT_CHANNEL_ID}`);

    channel.send({
      embed: generateRemoveMemberEmbed(name)
    }); 
  });
});

client.on('message', async (msg) => {
  const args = msg.content.slice(1).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === 'ola') {
    msg.channel.send(`olá ${msg.author.username}`);
  }

  if (command === 'clear') {
    // This command removes all messages from all users in the channel, up to 100.

    if (msg.author.id === `${process.env.YURI_ID}`) {
      // get the delete count, as an actual number.
      const deleteCount = parseInt(args[0], 10);

      // Ooooh nice, combined conditions. <3
      if (!deleteCount || deleteCount < 2 || deleteCount > 100) {
        return msg.reply("Please provide a number between 2 and 100 for the number of messages to delete");
      }

      try {
        await msg.channel.bulkDelete(deleteCount);
        msg.channel.send(`O usuário ${msg.author.username} limpou ${deleteCount} mensagens!`);
      } catch (err) {
        console.log(err)
      }
    } else {
      msg.channel.send(`olá ${msg.author.username}, você não tem permissão para limpar esse chat!`);
    }
  }

  if(command === 'ban') {
    // Most of this command is identical to kick, except that here we'll only let admins do it.
    // In the real world mods could ban too, but this is just an example, right? ;)
    if(!msg.member._roles.includes(`${process.env.ADM_ID}`))
      return msg.reply('Você nao tem permissão!');
    
    let member = msg.mentions.members.first();
    if(!member)
      return msg.reply('Esse usuário nao existe!');
    if(!member.bannable) 
      return message.reply('Eu não consigo banir esse usuário');

    let reason = args.slice(1).join(' ');
    if(!reason) reason = 'nao identificado';

    const channel = client.channels.cache.get(`${process.env.PUNISHMENT_CHANNEL_ID}`);
    
    await member.ban(reason)
      .catch(error => msg.reply(`Desculpe ${msg.author} Eu nao consegui banir pelo motivo: ${error}`));

    channel.send({
      embed: generateEmbed(
        member.user.tag,
        msg.author.tag,
        reason,
        'banido(a)'
      ),
    });
  }

  if (command === 'kick') {
    const member = msg.mentions.members.first();

    // No mentions catch
    if (!member) return;

    await member.kick();

    msg.reply(`${member.user.tag} foi kickado por ${msg.author.tag}!`);

    const channel = client.channels.cache.get(`${process.env.PUNISHMENT_CHANNEL_ID}`);

    let reason = args.slice(1).join(' ');
    if(!reason) reason = 'nao identificado';

    channel.send({
      embed: generateEmbed(
        member.user.tag,
        msg.author.tag,
        reason,
        'kickado(a)'
      ),
    });
  }

  if (command === 'say') {
    let message = args;

    if(message.length === 0) {
      const card = `
        > ***!say***
        > 
        > Faça eu falar algo!
        > 
        > 
        > **Exemplo**
        > ***!say (mensagem)***
      `;
  
      msg.reply(card);
    } else {
      msg.reply(message.join(' '))
    }
  }

  if (command === 'mute') {
    const member = msg.mentions.members.first();

    // No mentions catch
    if (!member) return;

    await member.setMute(true);
  }
});

client.login(`${process.env.GEEK_TOKEN}`);