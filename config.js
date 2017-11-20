/**
 * Created by drouar_b on 29/09/2017.
 */

module.exports = {
    port: 3001,
    sql: {
        database: 'oauth',
        username: 'root',
        password: '',
        dialect: 'mysql',
        logging: true,
        timezone: '+00:00',
    },
    redis: {
        host: '127.0.0.1',
        port: '6379',
        database: 1,
    }
};