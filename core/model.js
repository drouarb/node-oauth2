/**
 * Created by drouar_b on 29/09/2017.
 */

const _ = require('lodash');
const bcrypt = require('bcrypt');
const sql = require('../storage/sql');
const redis = require('../storage/redis');

class Model {
    /**
     * Retrieve the user and client from an accessToken
     *
     * @param bearerToken
     */
    static getAccessToken(bearerToken) {
        return redis.getAccessToken(bearerToken).then((redis) => {
            redis.id = redis.user.id;
            redis.client_id = redis.client.id;
            redis.scope = redis.user.scope;
            redis.grants = redis.client.grants;
            redis.redirectUris = redis.client.redirectUris;
            return redis;
        })
    }

    /**
     * Retrieve a client (an application) in the database
     *
     * @param clientId
     * @param clientSecret
     */
    static getClient(clientId, clientSecret) {
        const options = {
            where: {
                client_id: clientId
            },
            attributes: [
                'id',
                'client_id',
                'redirect_uri',
                'scope'
            ],
        };
        if (clientSecret) options.where.client_secret = clientSecret;

        return sql.OAuthClient
            .findOne(options)
            .then(function (client) {
                if (!client) return new Error("client not found");
                let clientWithGrants = client.toJSON();
                clientWithGrants.grants = ['authorization_code', 'password', 'refresh_token', 'client_credentials'];

                clientWithGrants.redirectUris = [clientWithGrants.redirect_uri];
                delete clientWithGrants.redirect_uri;
                return clientWithGrants
            }).catch(function (err) {
                console.log("getClient - Err: ", err)
            });
    }

    /**
     * Find a user in database and check the password
     *
     * @param username
     * @param password
     */
    static getUser(username, password) {
        return sql.User
            .findOne({
                where: {username: username},
                attributes: ['id', 'username', 'password', 'scope'],
            })
            .then(function (user) {
                return bcrypt.compareSync(password, user.password) ? user.toJSON() : false;
            })
            .catch(function (err) {
                console.log("getUser - Err: ", err)
            });
    }

    static revokeAuthorizationCode(code) {
        console.log('revokeAuthorizationCode');
    }

    /**
     * Save the generated access and refresh token
     *
     * @param token
     * @param client
     * @param user
     */
    static saveToken(token, client, user) {
        return Promise.all([
                redis.saveAccessToken(token.accessToken, client, user, token.scope, token.accessTokenExpiresAt),
                token.refreshToken ?
                    redis.saveRefreshToken(token.refreshToken, client, user, token.scope, token.refreshTokenExpiresAt) : [],
            ]
        ).then(() => {
            return _.assign({
                    client: client,
                    user: user,
                    access_token: token.accessToken,
                    refresh_token: token.refreshToken,
                },
                token
            );
        })
    }

    static getAuthorizationCode(code) {
        console.log('getAuthorizationCode');
    }

    static saveAuthorizationCode(code, client, user) {
        console.log(code);
        console.log('saveAuthorizationCode');
    }

    static getUserFromClient(client) {
        let options = {
            where: {client_id: client.client_id},
            include: [sql.User],
            attributes: ['id', 'client_id', 'redirect_uri'],
        };
        if (client.client_secret) options.where.client_secret = client.client_secret;

        return sql.OAuthClient
            .findOne(options)
            .then(function (client) {
                if (!client)
                    return false;
                if (!client.User)
                    return false;
                return client.User.toJSON();
            }).catch(function (err) {
                console.log("getUserFromClient - Err: ", err)
            });
    }

    /**
     * Check if the refreshToken exists
     *
     * @param refreshToken
     */
    static getRefreshToken(refreshToken) {
        if (!refreshToken || refreshToken === 'undefined')
            return false;

        return redis.getRefreshToken(refreshToken)
    }

    /**
     * Invoked to check if the requested scope is valid for a particular client/user combination.
     *
     * @param token
     * @param client
     */
    static validateScope(token, client) {
        return true;
    }

    /**
     * Invoked during request authentication to check if the provided access token was authorized the requested scopes.
     *
     * @param token
     * @param scope
     */
    static verifyScope(token, scope) {
        return token.scope === scope
    }

    /**
     * Revoke the given refreshToken token
     *
     * @param token
     */
    static revokeToken(token) {
        return redis.delRefreshToken(token.refreshToken).then(() => {
            return true
        })
    }
}

module.exports = Model;