/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.renameTable('playlist', 'playlists');
};

exports.down = (pgm) => {};
