const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST, // pakai NAMA SERVICE docker
    dialect: 'mysql',
    logging: false,
  }
);

const connectWithRetry = async () => {
  let retries = 30;

  while (retries > 0) {
    try {
      await sequelize.authenticate();
      console.log('✅ Database connected');
      return;
    } catch (err) {
      retries--;
      console.log(`⏳ DB not ready, retrying... (${retries})`);
      await new Promise(res => setTimeout(res, 4000));
    }
  }

  throw new Error('❌ Could not connect to database');
};


module.exports = { sequelize, connectWithRetry };
