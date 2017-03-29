module.exports = function(sequelize, DataTypes) {
    var ReposHistory = sequelize.define('ReposHistory', {
            userId: {
                type: DataTypes.INTEGER
            },
            repoName: {
                type: DataTypes.STRING
            },
            URL: {
                type: DataTypes.STRING
            }
        },
        {
            class_methods: {
                associate: function(models){
                    ReposHistory.belongsTo(models.Users, {
                        foreignKey: 'userId'
                    })
                }
            }
        },
        {
            timestamps: false
        });
    return ReposHistory;
};