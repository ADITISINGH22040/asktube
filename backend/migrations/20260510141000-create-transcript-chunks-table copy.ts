import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable('transcript_chunks', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      videoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'videos',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      transcriptId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'transcripts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      chunkIndex: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      startSec: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: true,
      },
      endSec: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
      },
      embedding: {
        type: 'VECTOR(1536)',
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('transcript_chunks', ['videoId', 'chunkIndex'], {
      unique: false,
      name: 'transcript_chunks_video_id_chunk_index',
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('transcript_chunks');
  },
};
