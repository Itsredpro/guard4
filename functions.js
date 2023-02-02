const mineflayer = require('mineflayer')
const pvp = require('mineflayer-pvp').plugin
const armormanager = require('mineflayer-armor-manager')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const proxys = require('./proxys.json')
var Socks  = require("socks5-client");

var proxcount = 0


module.exports.createbot = (host, port, username, password, version, auth, proxy) =>{
    if (proxy != undefined){
        proxy = Socks.createConnection({
            host: host,
            port: port,
            socksHost: proxy.host,
            socksPort: proxy.port
        })
    }


    var bot = mineflayer.createBot({
        username: username,
        host: host,
        port: port || 25565,
        password: password || undefined,
        version: version || undefined,
        auth: auth || 'mojang',
        stream: proxy || undefined,
        logErrors: false
    })
    return bot
}

module.exports.getproxy = ()=>{
    if (proxcount == proxys.length){
        return false
    }
    var cproxy = proxys[proxcount]

    proxcount = proxcount + 1

    cproxy = cproxy.split(':')

    var proxyobj = {
        host: cproxy[0],
        port: cproxy[1]
    }
    
    return proxyobj
}


module.exports.resourcepack = {}
module.exports.resourcepack["1.10.2 >"] = {}
module.exports.resourcepack["< 1.10.2"] = {}

module.exports.resourcepack['< 1.10.2'].accept = function(bot){
    bot._client.write('resource_pack_receive', { 
        hash: "Resourcepack", result: 3 
    }) 
    bot._client.write('resource_pack_receive', { 
        hash: "Resourcepack", result: 0 
    })
}
module.exports.resourcepack['< 1.10.2'].deny = function(bot){
    bot._client.write('resource_pack_receive', { 
        hash: "Resourcepack", result: 1
    })
}

module.exports.resourcepack['1.10.2 >'].accept = function(bot){
    const TEXTURE_PACK_RESULTS = {
        SUCCESSFULLY_LOADED: 0,
        DECLINED: 1,
        FAILED_DOWNLOAD: 2,
        ACCEPTED: 3
    }

    bot._client.write('resource_pack_receive', {
        result: TEXTURE_PACK_RESULTS.ACCEPTED
    })
    bot._client.write('resource_pack_receive', {
        result: TEXTURE_PACK_RESULTS.SUCCESSFULLY_LOADED
    })
}
module.exports.resourcepack['1.10.2 >'].deny = function(bot){
    bot._client.write('resource_pack_receive', {
        result: 1
    })
}