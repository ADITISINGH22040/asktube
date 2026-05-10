import {QueryInterface, DataTypes} from 'sequelize';

const up = async (queryInterface: QueryInterface) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    // Add your migration here
  });
};

const down = async (queryInterface: QueryInterface) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    // Add your rollback here
  });
};

export {up, down};

//videos: (id, youtubeId, url, title, channelName, thumbnailUrl, status, created_at, updated_at)
// transcripts: (id, videoId, language, rawText, created_at, updated_at)
// transcript_chunks: (id, videoId, transcriptId, chunkIndex, startSec, endSec, content, embedding, created_at)
// digests: (id, videoId, contentMarkdown, created_at, updated_at)
