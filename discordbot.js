
const { config } = require('dotenv');
require('dotenv').config();
const Discord = require('discord.js');
const {TwitterApi, ETwitterStreamEvent} = require('twitter-api-v2');
const fs = require('fs');
const client = new Discord.Client();

const t = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

async function setupStream(){
  const rules = await t.v2.streamRules();
  if (rules.data?.length){
    await t.v2.updateStreamRules({
      delete:{ids: rules.data.map(rule => rule.id)},
    });
  }
  console.log("Old rules deleted");
  await t.v2.updateStreamRules({
    add: [{value: 'from:FootyScran -is:retweet has:media'}]
  });
  console.log("New rules created");

  const stream = await t.v2.searchStream({
    'tweet.fields': ['referenced_tweets', 'author_id'],
    expansions: ['referenced_tweets.id'],
  });
  stream.autoReconnect = true;
  console.log("Stream established");
  stream.on(ETwitterStreamEvent.Data, async tweet => {
    try{
      client.channels.cache.get(process.env.DISCORD_CHANNEL_ID).send(`https://twitter.com/FootyScran/status/${tweet.data.id}`);
      console.log("Tweet received");
    } catch(e){
      console.log(e);
    }
  })
}






client.on('ready',() => {
  console.log(`Connected to a channel as ${client.user.tag}`);
  setupStream();
})

client.login(process.env.DISCORD_TOKEN);
