module.exports = function(sequelize, DataTypes) {
    var TidyRepos = sequelize.define('TidyRepos', {
        userId: {
            type: DataTypes.INTEGER
        },
        repoName: {
            type: DataTypes.STRING
        },
        URL: {
            type: DataTypes.STRING
        }
    }, {
        classMethods: {
            associate: function(models) {
                TidyRepos.belongsTo(models.Users, {
                    foreignKey: 'userId'
                })
            }
        }
    }, {
        timestamps: false
    });
    return TidyRepos;
};