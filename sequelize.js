const Sequelize = require('sequelize')
const PlayerModel = require('./models/player')
const { DATABASE_NAME, ROOT, PASSWORD, HOST, DIALECT } = require('./constants')
const sequelize = new Sequelize(DATABASE_NAME, ROOT, PASSWORD, {
  host: HOST,
  dialect: DIALECT,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})
const Player = PlayerModel(sequelize, Sequelize)
sequelize.sync({ force: false })
  .then(() => {
    console.log(`Database & tables created here!`)
  })
module.exports = {
  Author
}