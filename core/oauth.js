/**
 * Created by drouar_b on 29/09/2017.
 */

const oauthServer = require('oauth2-server');
const Request = oauthServer.Request;
const Response = oauthServer.Response;

const oauth = new oauthServer({
    model: require('./model')
});

class OAuth {
    static token(req, res) {
        let request = new Request(req);
        let response = new Response(res);

        oauth.token(request, response).then((token) => {
            return res.json(token)
        }).catch((err) => {
            return res.status(500).send(err);
        });
    }

    static postAuthorise(req, res) {
        let request = new Request(req);
        let response = new Response(res);

        return oauth.authorize(request, response).then(function(success) {
            res.json(success)
        }).catch(function(err){
            res.status(err.code || 500).json(err)
        })
    }

    static authenticate(req, res, next) {
        let request = new Request({
            headers: {authorization: req.headers.authorization},
            method: req.method,
            query: req.query,
            body: req.body
        });
        let response = new Response(res);

        oauth.authenticate(request, response, {})
            .then((token) => {
                req.user = token;
                next()
            })
            .catch((err) => {
                res.status(err.code || 500).json(err)
            })
    }

}

module.exports = OAuth;