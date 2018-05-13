const users = require('./users');
const combats = require('./combats');

module.exports = function(app) {
    app.get('/ping', (req, res) => {
        res.send('pong');
    });

    app.post('/register', (req, res) => {
        const result = users.create(req.body.username);

        if (result) {
            res.send({
                status: 'ok',
                user: result
            });
        } else {
            res.status(400).send({
                status: 'error',
                message: 'Пользователь существует'
            });
        }
    });

    app.get('/whoami', (req, res) => {
        const result = users.get(req.query.user_id);

        if (result) {
            users.touch(result.id);

            res.send({
                status: 'ok',
                user: result
            });
        } else {
            res.status(400).send({
                status: 'error',
                message: 'Пользователь не существует'
            });
        }
    });

    app.post('/login', (req, res) => {
        const result = users.get(req.body.user_id);

        if (result) {
            if (users.touch(result.id)) {
                res.send({
                    status: 'ok',
                    user: result
                });
            } else {
                res.status(500).send({
                    status: 'error',
                    message: 'Не удалось залогиниться'
                });
            }
        } else {
            res.status(400).send({
                status: 'error',
                message: 'Пользователь не существует'
            });
        }
    });

    app.get('/online', (req, res) => {
        const onlineUsers = users.online();

        res.send({
            status: 'ok',
            users: onlineUsers
        });
    });

    app.post('/fight', (req, res) => {
        const user = users.get(req.body.user_id);

        if (!user) {
            res.status(400).send({
                status: 'error',
                message: 'Обязательны данные пользователя'
            });

            return;
        }

        if (!users.isOnline(user)) {
            res.status(403).send({
                status: 'error',
                message: 'Чтобы сражаться, нужно быть онлайн'
            });

            return;
        }

        users.touch(user.id);

        const combatForUser = combats.create(user);

        res.send({
            status: 'ok',
            combat: combatForUser
        });
    });

    app.post('/turn', (req, res) => {
        const user = users.get(req.body.user_id);
        const combat = combats.get(req.body.combat_id);

        if (!user) {
            res.status(400).send({
                status: 'error',
                message: 'Обязательны данные пользователя'
            });

            return;
        }

        if (!users.isOnline(user)) {
            res.status(403).send({
                status: 'error',
                message: 'Чтобы сражаться, нужно быть онлайн'
            });

            return;
        }

        users.touch(user.id);

        if (!combat) {
            res.status(400).send({
                status: 'error',
                message: 'Обязательны данные боя'
            });

            return;
        }

        if (!combat.status === 'progress') {
            res.status(400).send({
                status: 'error',
                message: 'Бой не проходит'
            });

            return;
        }

        const turn = req.body.turn;

        if (!turn) {
            res.status(400).send({
                status: 'error',
                message: 'Нет данных хода'
            });
        }

        res.send({
            status: 'ok',
            combat: combats.turn(combat, user, JSON.parse(turn))
        });
    });

    app.get('/status', (req, res) => {
        const user = users.get(req.query.user_id);
        const combat = combats.get(req.query.combat_id);

        if (!user) {
            res.status(400).send({
                status: 'error',
                message: 'Обязательны данные пользователя'
            });

            return;
        }

        users.touch(user.id);

        if (!combat) {
            res.status(400).send({
                status: 'error',
                message: 'Обязательны данные боя'
            });

            return;
        }

        res.send({
            status: 'ok',
            combat: combats.combatDataForUser(combat, user)
        });
    });
};
