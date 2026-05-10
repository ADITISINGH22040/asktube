import {QueryInterface, DataTypes} from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable('videos', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      youtubeId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      channelName: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      thumbnailUrl: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('IMPORTING', 'READY', 'FAILED'),
        allowNull: false,
        defaultValue: 'IMPORTING'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('videos', ['youtubeId'], {
      unique: true,
      name: 'videos_youtube_id_unique'
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('videos');
  }
};
