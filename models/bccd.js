const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

async function executeQuery(query, params) {
    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.query(query, params);
        return results;
    } catch (error) {
        console.error('Erro ao executar consulta:', error);

        // Tentativa de reconexão em caso de perda de conexão
        if (error.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Conexão perdida. Tentando reconectar...');
            pool = mysql.createPool(dbConfig);
        }
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

module.exports = {
    executeQuery
};