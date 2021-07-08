const InvariantError = require('../../exceptions/InvariantError');
const { PostPlaylistPayloadSchema, PostAddSongToPlaylistPayloadSchema } = require('./schema');

const PlaylistsValidator = {
    validatePostPlaylistPayload: (payload) => {
      const validationResult = PostPlaylistPayloadSchema.validate(payload);
      if (validationResult.error) {
          throw new InvariantError(validationResult.error.message);
      }
    },
    validatePostAddSongToPlaylistPayload: (payload) => {
        const validationResult = PostAddSongToPlaylistPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = PlaylistsValidator;
