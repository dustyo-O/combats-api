const fs = require('fs');
const hash = require('random-hash');

module.exports = {
    init: function() {
        if (!this._users) {
            this._users = JSON.parse(
                fs.readFileSync('./json/users.json')
            );
        }
    },

    list: function() {
        this.init();

        return this._users.map(user => this.userData(user, true));
    },

    get: function(id, fullData = false) {
        this.init();

        const user = this._users.find(function(item) { return item.id === id });

        if (fullData) {
            return user;
        } else {
            return this.userData(user, true);
        }
    },

    me: function(token, hideToken = false) {
        this.init();

        if (!token) return;

        const me = this._users.find(function (item) { return item.token === token });

        if (me && this.isOnline(me)) {
            this.touch(me.id);

            return this.userData(me, hideToken);
        }
    },

    find: function(username, keepPassword) {
        this.init();

        return this.userData(this._users.find(function(item) { return item.username === username }), true, keepPassword);
    },

    exists: function(username) {
        return Boolean(this.find(username));
    },

    create: function(username, password) {
        if (this.exists(username)) {
            return;
        }

        const user = {
            id: hash.generateHash(),
            token: hash.generateHash({ length: 10 }),
            username: username,
            password: password,
            last_active: + new Date()
        };

        this._users.push(user);

        this.write()

        return this.userData(user);
    },

    auth: function (username, password) {
        const user = this.find(username, true);

        if ((user.password !== password) || (user.username !== username)) {
            return;
        }

        user.token = hash.generateHash({ length: 10 });

        this.touch(user.id, user.token);

        return this.userData(user);
    },

    touch: function(id, token) {
        this.init();

        const user = this.get(id, true);

        if (!user) return;

        user.last_active = + new Date();

        if (token) user.token = token;

        this.write();

        return true;
    },

    write: function() {
        this.init();

        fs.writeFileSync('./json/users.json', JSON.stringify(this._users, null, 4));
    },

    online: function() {
        this.init();

        return this._users.filter(this.isOnline).map(user => this.userData(user, true));
    },

    isOnline(user) {
        const now = + new Date();

        return user.last_active && (now - user.last_active) < (600 * 1000);
    },

    userData(user, hideToken = false, keepPassword) {
        if (!user) return;

        const data = Object.assign({}, user);

        if (!keepPassword) {
            delete data.password;
        }

        if (hideToken) {
            delete data.token;
        }

        return data;
    }
};
