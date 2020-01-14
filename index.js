const express = require('express')
const bodyParser = require('body-parser')
const { Player } = require('./sequelize')
const app = express()
app.use(bodyParser.json())

// Set Random Initial State
// Inital ST = 50
const set_initial_points = (sp = 50) => {
  let a = [];
  let sum = 0;
  for(let i = 0; i < 4; i ++){
    const temp = Math.round( Math.random() * ((sp / 5) - sum) );
    sum += temp;
    a[i] = temp * 5;
  }
  a[4] = 50 - sum * 5;
  const inital_st = {
    str: a[0],
    agi: a[1],
    dex: a[2],
    lux: a[3],
    int: a[4],
    hp: 80 + Math.round( a[0] * 0.327 ),
    mp: 35 + Math.round( a[4] * 0.304 ),
    p_atk: 2 * a[0],
    p_def: Math.round(0.75 * a[0] + 1.25 * a[2]),
    m_atk: 3 * a[4],
    m_def: Math.round(1.4 * a[4] + 0.6 * a[2]),
    criti_damage: Math.round(a[3] * 1.065),
    criti_chance: Math.round(a[1] * 0.2),
    level: 0,
    coin: 0,
    exp: 0,
  }
  return inital_st;
}

// Generate Creeper for Fight
const generateCreeper = () => {
  const level = Math.round( Math.random() * 20 );
  const sp = 50 + level * 10;
  const coin = Math.round( Math.random * 400 + level * 5 )
  const creature_info = set_initial_points(sp);
  return {
    ...creature_info,
    level,
    coin
  }
}

// Generate Healer
const Header = () => {
  const level = Math.round( Math.random() * 20 );
  const hp_cost = Math.round((Math.random()) * (20 - level)) + 5;
  const mp_cost = Math.round((Math.random()) * (20 - level)) + 7;
  return {
    level,
    hp_cost,
    mp_cost
  }
}

// Calculate Experience when you defeated creeper
const getExp = (player, creeper) => {
  const level_difference = creeper.level - player.level;
  const exp = level_difference * 23 + Math.round ( Math.random() * 200 );
  const coin = creeper.coin;
  player.update({
    exp: player.exp + exp,
    coin: player.coin + coin
  });
  return {exp, coin};
}

// Calculate Experience when you are defeated by creeper
const lostExp = (player) => {
  const exp = Math.round(player.level * Math.random() * player.level * 100);
  const coin = Math.round(player.level * Math.random() + Math.random * 50);
  player.update({
    exp: player.exp - exp,
    coin: (player.coin - coin) > 0 ? (player.coin - coin) : 0  
  });
  return {exp: -exp, coin: (player.coin > 0 ?  -coin : 0) };
}

// Fight with Creeper
const fight = (player, creeper, skill) => {
  let damage = 0;
  if ( skill == 0 ) {
    damage = player.p_atk + ((100 - Math.random() * 100) < player.criti_chance ? 1 : 0) * player.criti_damage;
    if ( damage > (creeper.hp + creeper.p_def) ) {
      return 1;
    }
  } else {
    damage = player.m_atk + ((100 - Math.random() * 100) < player.criti_chance ? 1 : 0) * player.criti_damage;
    if ( damage > (creeper.hp + creeper.m_def) ) {
      return 1;
    }
  }
  const c_skill = creeper.mp >= 3 ? Math.round(Math.random()) : 0;
  let c_damage = 0;
  if (c_skill == 0) {
    c_damage = creeper.p_atk + ((100 - Math.random() * 100) < creeper.criti_chance ? 1 : 0) * creeper.criti_damage;
    if ( c_damage > (player.hp + player.p_def) ) {
      return -1;
    }
  } else {
    c_damage = creeper.m_atk + ((100 - Math.random() * 100) < creeper.criti_chance ? 1 : 0) * creeper.criti_damage;
    if ( c_damage > (player.hp + player.m_def) ) {
      return -1;
    }
  }
  c_damaged = c_damage - (c_skill ? player.m_def : player.p_def)
  player.update({hp: player.hp - (c_damaged > 0 ? c_damaged : 0)})

  if ( c_skill == 1 ) {
    creeper.mp -= 3;
  }

  p_damaged = damage - (skill ? creeper.m_def : creeper.p_def)
  creeper.hp = creeper.hp - (p_damaged > 0 ? p_damaged : 0)

  if (skill == 1) {
    player.update({mp: player.mp - 3})
  }

  return {
    player: player,
    creeper: creeper
  }
}

// Explore Map
const exploreMap = () => {
  const npc = Math.round(Math.random() * 10);
  if (npc == 3 || npc == 9 || npc == 6) {
    return {
      type: 'healer',
      details: generateHealer()
    };
  } else {
    return {
      type: 'creeper',
      details: generateCreeper()
    }
  }
}

// Create a Player
app.post('/api/player', (req, res) => {
  const inital_st = set_initial_points();
  const playerInfo = {
    ...req.body,
    ...inital_st
  }
  Player.create(playerInfo)
    .then(player => res.json(player))
})

// get player by id
app.get('/api/player/:id', (req, res) => {
  Player.findOne(
    {
      where: { id: req.params.id, },
    }
  ).then(player => res.json(player))
})

// Explore Map and meet Healer or Creeper.
app.get('/api/explore-map', (req, res) => {
  res.json(exploreMap())
})

// Fight with Creeper API endpoint
app.post('/api/fight/player/:id', (req, res) => {
  Player.findOne(
    {
      where: { id: req.params.id, },
    }
  ).then(player => {
    const result = fight(player, req.body.creeper, req.body.skill);
    let response = {};
    if (result == 1) {
      return getExp(player, creeper)
    } else if (result == -1) {
      return lostExp(player)
    }
  })
})
const port = 3001
app.listen(port, () => {
  console.log(`Running on http://localhost:${port}`)
})