const users = require('./users');
const combats = require('./combats');
const chat = require('./chat');

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
            res.status(409).send({
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
            res.status(403).send({
                status: 'error',
                message: 'Токен устарел или не существует'
            });
        }
    });

    app.get('/info', (req, res) => {
        const observer = users.me(req.query.token);

        if (observer) {
            const user = users.get(req.query.user_id);

            if (user) {
                res.send({
                    status: 'ok',
                    user: user,
                    combats: combats.listByUser(user, observer)
                });
            } else {
                res.status(400).send({
                    status: 'error',
                    message: 'Пользователь не найден'
                });
            }

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
                res.status(403).send({
                    status: 'error',
                    message: 'Не удалось залогиниться (имя пользвателя или пароль неверные)'
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
            res.status(403).send({
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
            res.status(403).send({
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
            res.status(403).send({
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

    app.post('/chat', (req, res) => {
        const user = users.me(req.body.token, true);

        if (!user) {
            res.status(403).send({
                status: 'error',
                message: 'Обязательны данные пользователя'
            });
        }

        const { message, timestamp } = req.body;

        if (!message) {
            res.status(400).send({
                status: 'error',
                message: 'Сообщение не передано'
            });

            return;
        }

        if (chat.post(message, user)) {
            res.send({
                status: 'ok',
                chat: chat.get(timestamp)
            });
        } else {
            res.status(500).send({
                status: 'error',
                message: 'Сообщение не добавлено'
            });
        }
    });

    app.get('/chat', (req, res) => {
        const user = users.me(req.query.token);

        if (!user) {
            res.status(403).send({
                status: 'error',
                message: 'Обязательны данные пользователя'
            });
        }

        const timestamp = req.query.timestamp;

        res.send({
            status: 'ok',
            chat: chat.get(timestamp)
        });
    });
};
