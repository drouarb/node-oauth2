/**
 * Created by drouar_b on 06/10/2017.
 */

const redis = require('redis');
const bluebird = require('bluebird');
const config = require('../config');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

class Redis {
    constructor() {
        this.client = redis.createClient({
            host: config.redis.host,
            port: config.redis.port,
            db: config.redis.database
        });
    }

    saveAccessToken(token, client, user, scope, expires) {
        return this.client.setAsync('access:' + token, JSON.stringify({
            access_token: token,
            accessToken: token,
            user: user,
            client: client,
            scope: scope,
            accessTokenExpiresAt: expires
        }), 'EX', Math.round((expires - Date.now()) / 1000))
    }

    saveRefreshToken(token, client, user, scope, expires) {
        this.client.setAsync('refresh:' + token, JSON.stringify({
            refresh_token: token,
            refreshToken: token,
            user: user,
            client: client,
            scope: scope,
            refreshTokenExpiresAt: expires
        }), 'EX', Math.round((expires - Date.now()) / 1000))
    }

    getAccessToken(token) {
        return this.client.getAsync('access:' + token).then((json) => {
            let ret = JSON.parse(json);
            ret.accessTokenExpiresAt = new Date(ret.accessTokenExpiresAt);
            return ret;
        })
    }

    getRefreshToken(token) {
        return this.client.getAsync('refresh:' + token).then((json) => {
            let ret = JSON.parse(json);
            ret.refreshTokenExpiresAt = new Date(ret.refreshTokenExpiresAt);
            return ret;
        })
    }

    delAccessToken(token) {
        return this.client.delAsync('access:' + token)
    }

    delRefreshToken(token) {
        return this.client.delAsync('refresh:' + token)
    }
}

module.exports = new Redis();