const fs = require('fs');

module.exports = {
    init: function () {
        if (!this._chat) {
            this._chat = JSON.parse(
                fs.readFileSync('./json/chat.json')
            );
        }
    },

    get(timestamp) {
        this.init();

        if (!timestamp) timestamp = + new Date() - 600 * 1000;

        return this._chat.filter(message => message.timestamp > timestamp);
    },

    post(text, user) {
        this.init();

        message = {
            message: text,
            timestamp: + new Date(),
            user: user
        };

        this._chat.push(message);

        this.write();

        return true;
    },

    write: function () {
        this.init();

        fs.writeFileSync('./json/chat.json', JSON.stringify(this._chat, null, 4));
    }
}
