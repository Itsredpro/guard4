const mineflayer = require('mineflayer')
const pvp = require('mineflayer-pvp').plugin
const armormanager = require('mineflayer-armor-manager')
const autoeat = require("mineflayer-auto-eat")
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
//const makepvpbot = require("./pvpbot.js")
const functions = require("./functions.js")
const proxys = require('./proxys.json')
const townGuard = require('./townGuard.js')

/*
var botproxy = functions.getproxy()

for (a = 0 ; a < 2; a++){
    var bot = functions.createbot('localhost', '46471', 'bot' + a)

    makepvpbot.main(bot)
}*/

/*
async function a(){
    console.log("bot")
    //play.thearchon.net
    const bot = await functions.createbot("192.168.178.60","50487","fom",undefined,"1.18.2",undefined)

    bot.once('spawn',async ()=>{
        console.log("Bot spawned.")
        var en = await bot.nearestEntity(e => e.mobType != "Armor Stand")
        console.log(en.position.distanceTo(bot.entity.position))
    })

    bot._client.on('resource_pack_send', (data) => {
        console.log("resource pack received, proceeding...")
        functions.resourcepack['1.10.2 >'].accept(bot)
    })
    
    bot.on('login',()=>{
        console.log("logged in.")
    })
    bot.on('chat',(usr,msg)=>{
        console.log(usr + "\n")
        console.log(msg)
    })
    bot.on('end',(r)=>{console.log("disconnected: "+ r)})

    bot.on('kicked',(r)=>{console.log("kicked: "+ r)})
    
}
a()
*/
async function bk(){
    const bot = await functions.createbot("localhost",34481,"ok",undefined,"1.18.2",undefined)
    var coords = []
    try {
        coords = JSON.parse(process.argv[2])
    } catch {
        coords = JSON.parse(process.argv[2])
    }
    townGuard.main(bot,coords)
}
bk()