const users = require('./users');
const combats = require('./combats');

module.exports = function(app) {
    app.get('/ping', (req, res) => {
        res.send('pong');
    });

    app.post('/register', (req, res) => {
        const result = users.create(req.body.username, req.body.password);

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
        const result = users.me(req.query.token);

        if (result) {
            res.send({
                status: 'ok',
                user: result
            });
        } else {
            res.status(400).send({
                status: 'error',
                message: 'Токен устарел или не существует'
            });
        }
    });

    app.post('/login', (req, res) => {
        const { username, password } = req.body;
        const result = users.exists(req.body.username);

        if (result) {
            const user = users.auth(username, password);
            if (user) {
                res.send({
                    status: 'ok',
                    user: user
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
        const user = users.me(req.body.token);

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

        const combatForUser = combats.create(user);

        res.send({
            status: 'ok',
            combat: combatForUser
        });
    });

    app.post('/turn', (req, res) => {
        const user = users.me(req.body.token);
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
        const user = users.me(req.query.token);
        const combat = combats.get(req.query.combat_id);

        if (!user) {
            res.status(400).send({
                status: 'error',
                message: 'Обязательны данные пользователя'
            });

            return;
        }

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
