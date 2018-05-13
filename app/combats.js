const fs = require('fs');
const hash = require('random-hash');

module.exports = {
    init: function() {
        if (!this._combats) {
            this._combats = JSON.parse(
                fs.readFileSync('./json/combats.json')
            );
        }
    },

    list: function() {
        this.init();

        return this._combats;
    },

    get: function(id) {
        this.init();

        return this._combats.find(function(item) { return item.id === id });
    },

    getPending: function() {
        this.init();

        return this._combats.find(function(item) { return item.status === 'pending' });
    },

    findByUser: function(user) {
        this.init();

        return this._combats.find(function(item) {
            if (item.status === 'finished') return;

            return item.players.some(function(player) {
                return player.id === user.id;
            });
        });
    },

    create: function(user) {
        if (this.findByUser(user)) return;

        const pending = this.getPending();

        user.health = 30;

        if (pending) {
            pending.status = 'progress';
            pending.players.push(user);

            this.write();

            return pending;
        }

        const combat = {
            id: hash.generateHash(),
            status: 'pending',
            players: [user],
            turns: [[]],
            results: [],
            turn_start: + new Date()
        };

        this._combats.push(combat);

        this.write();

        return this.combatDataForUser(combat, user);
    },

    turnAllowed: function(combat, user) {

        if (!(combat && (combat.status === 'progress'))) return;

        return combat.turns[combat.turns.length - 1].every(function (turn) {
            return !(turn.user.id === user.id);
        });
    },

    turn: function (combat, user, turn) {
        if (!(combat && (combat.status === 'progress'))) return;

        if (this.turnAllowed(combat, user)) {
            combat.turns[combat.turns.length - 1].push({
                user: user,
                turn: turn
            });

            if (combat.turns[combat.turns.length - 1].length === combat.players.length) {
                this._calculateTurn(combat);
            }
        }

        this.write();

        return this.combatDataForUser(combat, user);
    },

    _calculateTurn: function(combat) {
        const turn = combat.turns[combat.turns.length - 1];

        const kicks = [
            {
                origin: turn[0].user,
                target: turn[1].user,
                hit: turn[0].hit,
                blocked: turn[1].blocks.includes(turn[0].hit)
            },
            {
                origin: turn[1].user,
                target: turn[0].user,
                hit: turn[1].hit,
                blocked: turn[0].blocks.includes(turn[1].hit)
            }
        ];

        kicks.forEach(function(kick) {
            if (!kick.blocked) {
                this._damage(combat, kick.target);
            }
        });

        combat.results.push(kicks);
        if (combat.players.every(function(player) {
            player.health > 0;
        })) {
            combat.turns.push([]);
        } else {
            combat.status = 'finished';
            combat.winner = combat.players.find(function(player) {
                player.health > 0;
            });
        }
    },

    _damage(combat, user) {
        const target = combat.players.find(function(player) {
            return player.id === user.id;
        });

        target.health -= (Math.random() * 5) + 1;
    },

    combatDataForUser(combat, user) {
        return {
            id: combat.id,
            status: combat.status,
            turn_status: this.turnAllowed(combat, user),
            results: combat.results,
            you: combat.players.find(function (player) {
                return player.id === user.id;
            }),
            enemy: combat.players.find(function(player) {
                return player.id !== user.id;
            })
        };
    },

    write: function() {
        this.init();

        fs.writeFileSync('./json/combats.json', JSON.stringify(this._combats, null, 4));
    }
};
