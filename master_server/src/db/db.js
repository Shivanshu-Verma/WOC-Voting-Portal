import Sequelize from "sequelize";

export const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host:  process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false,
});

export async function connectDB() {
    try {
        console.log(".....lokoko")
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}