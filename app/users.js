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

        return this._users;
    },

    get: function (id) {
        this.init();

        return this._users.find(function(item) { return item.id === id });
    },

    find: function(username) {
        this.init();

        return this._users.find(function(item) { return item.username === username });
    },

    exists: function(username) {
        return Boolean(this.find(username));
    },

    create: function(username) {
        if (this.exists(username)) {
            return;
        }

        const user = {
            id: hash.generateHash(),
            username: username
        };

        this._users.push(user);

        this.write()

        return user;
    },

    touch: function(id) {
        this.init();

        const user = this.get(id);

        if (!user) return;

        user.last_active = + new Date();

        this.write();

        return true;
    },

    write: function() {
        this.init();

        fs.writeFileSync('./json/users.json', JSON.stringify(this._users, null, 4));
    },

    online: function() {
        this.init();

        return this._users.filter(this.isOnline);
    },

    isOnline(user) {
        const now = + new Date();

        return user.last_active && now - user.last_active < 120 * 1000;
    }
};
