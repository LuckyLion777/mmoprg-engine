module.exports = (sequelize, type) => {
  return sequelize.define('player', {
      id: {
          type: type.INTEGER,
          primaryKey: true,
          autoIncrement: true
      },
      name: {
        type: type.STRING,
        unique: 'compositeIndex' 
      },
      level: type.INTEGER,
      exp: type.INTEGER,
      coin: type.INTEGER,
      str: type.INTEGER,
      agi: type.INTEGER,
      dex: type.INTEGER,
      lux: type.INTEGER,
      int: type.INTEGER,
      hp: type.INTEGER,
      mp: type.INTEGER,
      p_atk: type.INTEGER,
      p_def: type.INTEGER,
      m_atk: type.INTEGER,
      m_def: type.INTEGER,
      criti_damage: type.INTEGER,
      criti_chance: type.INTEGER
  })
}