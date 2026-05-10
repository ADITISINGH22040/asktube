import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS vector;');
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query('DROP EXTENSION IF EXISTS vector;');
  },
};
