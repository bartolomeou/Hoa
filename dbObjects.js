const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: console.log,
    storage: 'database.sqlite'
});

const Users = require('./models/Users.js')(sequelize, Sequelize.DataTypes);
const CurrencyShop = require('./models/CurrencyShop.js')(
    sequelize,
    Sequelize.DataTypes
);
const UserItems = require('./models/UserItems.js')(
    sequelize,
    Sequelize.DataTypes
);

// establish an association between the UserItems and CurrencyShop models
// each UserItem belongs to a CurrencyShop item using the foreign key item_id
UserItems.belongsTo(CurrencyShop, { foreignKey: 'item_id', as: 'item' });

Reflect.defineProperty(Users.prototype, 'addItem', {
    value: async function (item) {
        const userItem = await UserItems.findOne({
            where: { user_id: this.user_id, item_id: item.id }
        });

        if (userItem) {
            userItem.amount += 1;
            return userItem.save();
        }

        return UserItems.create({
            user_id: this.user_id,
            item_id: item.id,
            amount: 1
        });
    }
});

Reflect.defineProperty(Users.prototype, 'getItems', {
    value: function () {
        return UserItems.findAll({
            where: { user_id: this.user_id },
            include: ['item'] // include associated data from related models
        });
    }
});

module.exports = { Users, CurrencyShop, UserItems };