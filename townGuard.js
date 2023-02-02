const mineflayer = require('mineflayer')
const armormanager = require('mineflayer-armor-manager')
const autoeat = require("mineflayer-auto-eat")
const mpv = require("mineflayer-pvp").plugin
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')

const blacklist = []


var currentTarget = undefined
var currentpriority = 0
// 0 = idle / no current task
// 1 = walking to waypoint
// 2 = eating
// 3 = attack
// 4 = healing
// 5 = defend

// 10 = override current prio


function getMove(numb,bot){
    switch(numb){
        case 0:
            var move = new Movements(bot)
            move.canDig = false
            
            return move
    }
}

var bouncei = true
async function trowPotion(bot,amount,cb){
    if (bouncei){
        bouncei = false
        await bot.look(0, (-Math.PI)/2,true)

        function pot(){
            return new Promise(async r=>{
                await equipfromnbt(bot,"minecraft:strong_healing")
                bot.setQuickBarSlot(0)
                setTimeout(()=>{
                    //console.log("Use item")
                    bot.activateItem(false)
                    r()
                },50)
            }) 
        }
        
        for (var ok = 0; ok < amount; ok++){
            await pot()
        }
        //console.log("Equip pot")
        
        

        setTimeout(()=>{
            bouncei = true
            cb()
        },500)
    }
    

    
}


function equipfromnbt(bot,nbtd,dest){
    var ai = bot.inventory.slots
        for (var op = 0;op<ai.length;op++){
            if (ai[op] != null && ai[op].nbt != null){
                var nbt = ai[op].nbt
                
                if (nbt.value[Object.keys(nbt.value)[0]].value == nbtd){
                    dest = dest || bot.inventory.hotbarStart
                    bot.moveSlotItem(op,dest)
                    return
                }
                
            }
        }
}



module.exports.main = async function(bot,inarr){
    var bot = mineflayer.createBot()
    var xp = inarr[0]
    var yp = inarr[1]
    var zp = inarr[2]
    

    await bot.loadPlugin(armormanager)
    await bot.loadPlugin(pathfinder)
    await bot.loadPlugin(autoeat)
    await bot.loadPlugin(mpv)

    /*bot.autoEat.options = {
        priority: "saturation",
        startAt: 5,
        bannedFood: ["golden_apple", "enchanted_golden_apple", "rotten_flesh"],
    }
    //bot.autoEat.disable()*/
    var logs = ""

    bot.on('playercollect', (collector, player) =>{
        logs = logs + "Collected item\n"
    })


    

    bot.on('login',()=>{
        console.log("logged in.")
    })

    bot.on('spawn',()=>{
        console.log("bot spawn")
        //bot.activateItem(false)
        

        setInterval(async ()=>{
            console.clear()
            console.log(logs + "\nStats:\nHealth: " + bot.health.toString() + "\nHunger: " + bot.food.toString() + "\nCurrent prio: " + currentpriority.toString())


            //healing
            if (bot.health <= 11){
                logs = logs + "Trying to heal . . .\n"
                var lastPrio = currentpriority
                var bump = true
                currentpriority = 4
                if (bump){
                    trowPotion(bot,2,()=>{
                        bump = false
                        if (lastPrio == currentpriority){
                            currentpriority = 0
                        } else {
                            currentpriority = lastPrio  
                        }
                    })
                }

                

                //reset prio
                
            }

            //Emergency eating
            if (bot.food < 10){
                logs = logs + "Emergency eating . . .\n"
                var lastPrio = currentpriority
                currentpriority = 10
                
                bot.autoEat.eat(function (err) {
                    if (err) {
                    console.error(err)
                    } else {
                        //reset prio
                        if (lastPrio == currentpriority){
                            currentpriority = 0
                        } else {
                            currentpriority = lastPrio  
                        }
                    }
                })
            }


            //Normal eating
            if (currentpriority < 2 && bot.food < 15){
                logs = logs + "Trying to eat . . .\n"
                var lastPrio = currentpriority
                currentpriority = 2

                //eat
                bot.autoEat.eat(function (err) {
                    if (err) {
                    console.error(err)
                    } else {
                        
                        //reset priority's
                        if (lastPrio == currentpriority){
                            currentpriority = 0
                        } else {
                            currentpriority = lastPrio  
                        }
                    }
                })
            }
            
            var defendPoint = await bot.blockAt(inarr[0],inarr[1],inarr[2]) // defending point
            var EnemyClose = await bot.nearestEntity(e => e.mobType != "Armor Stand" && blacklist.indexOf(e) != -1) // filter
            if (defendPoint != null && EnemyClose != null){
                var enemydistance = await defendPoint.position.distanceTo(EnemyClose.position) // distance
                
                //Stop attacking.
                if (enemydistance >= 50 && currentTarget != undefined){
                    logs = logs + "Stopping attack . . .\n"
                    bot.pvp.stop()
                    currentpriority = 0
                }

                //Start attacking.
                if (enemydistance <= 20 && currentTarget == undefined && currentpriority < 5){
                    logs = logs + "Trying to attack . . .\n"
                    var lastPrio = currentpriority
                    currentpriority = 5

                    currentTarget = EnemyClose

                    bot.pvp.attack(EnemyClose)

                }
            }
            //logs = logs + JSON.stringify(defendPoint) + "\n"
            var distopoint = await bot.entity.position.distanceTo(require('vec3')(inarr[0],inarr[1],inarr[2]))
            if (distopoint != null && currentpriority < 1){
                var lastPrio = currentpriority
                currentpriority = 1
                var tim = undefined

                if (distopoint > 3){
                    logs = logs + "Trying to go back to defending point . . .\n"


                    bot.pathfinder.setMovements(getMove(0,bot))
                    bot.pathfinder.setGoal(new goals.GoalNear(inarr[0],inarr[1],inarr[2],2))

                    bot.on('goal_reached',()=>{
                        currentpriority = lastPrio
                        if (tim){
                            clearTimeout(tim)
                        }
                    })

                    tim = setTimeout(()=>{
                        currentpriority = lastPrio
                    },20000)
                    
                }

                if (distopoint < 3){
                    if (tim){
                        clearTimeout(tim)
                    }
                    
                    currentpriority = lastPrio
                }
            }

            
        },250)

    })
    
}