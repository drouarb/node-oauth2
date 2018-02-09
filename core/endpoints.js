/**
 * Created by drouar_b on 17/11/2017.
 */

const redis = require('../storage/redis');

class Endpoints {
    static token(req, res) {
        res.send(JSON.stringify({
            status: "success",
            id: req.user.user.id
        }))
    }

    static user(req, res) {
        if (req.user.user.username != req.params.user) {
            return res.status(403).send(JSON.stringify({
                error: "Invalid user/token"
            }))
        }
        res.send(JSON.stringify({
            username: req.user.user.username,
            id: req.user.user.id
        }))
    }
}

module.exports = Endpoints;