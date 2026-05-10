import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Drop the existing embedding column
    await queryInterface.removeColumn('transcript_chunks', 'embedding');
    
    // Add the embedding column with new dimension (768 instead of 1536)
    await queryInterface.addColumn('transcript_chunks', 'embedding', {
      type: 'VECTOR(768)',
      allowNull: true,
    });
  },

  down: async (queryInterface: QueryInterface) => {
    // Revert back to 1536 dimension
    await queryInterface.removeColumn('transcript_chunks', 'embedding');
    
    await queryInterface.addColumn('transcript_chunks', 'embedding', {
      type: 'VECTOR(1536)',
      allowNull: true,
    });
  },
};
