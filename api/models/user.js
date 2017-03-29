/*Users is where all users and passwords will be stored.  This will be joined to 
snippets to retrieve all the snippets for the user*/

/*===================================USERS TABLE MODEL=============================================*/

module.exports = function(sequelize, DataTypes) {
    //create a model of the table for sequelize
    var Users = sequelize.define('Users', {
        name: {
            type: DataTypes.STRING
        },
        accessToken: {
            type: DataTypes.STRING
        },
        githubId: {
            type: DataTypes.STRING
        },
        username: {
            type: DataTypes.STRING
        },

        profileUrl: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING
        },

        photo: {
            type: DataTypes.STRING
        }

    },
        /*{
        class_methods: {
            associate: function(models) {
                User.hasMany(models.ReposHistory, {
                    foreignKey: 'id'
                });
            }
        }
        },*/

        {
        timestamps: false
    });
    return Users;
};

/*=================================END USERS TABLE MODEL=============================================*/