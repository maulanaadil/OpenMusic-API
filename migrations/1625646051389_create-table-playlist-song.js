/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createTable('playlistsongs', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        playlist_id: {
            type: 'VARCHAR(50)',
        },
        song_id: {
            type: 'VARCHAR(50)',
        },
    });

    pgm.addConstraint('playlistsongs', 'fk_playlistsongs.playlist_id.id', 'FOREIGN KEY (playlist_id) REFERENCES playlist (id) ON DELETE CASCADE');
    pgm.addConstraint('playlistsongs', 'fk_playlistsongs.song_id.id', 'FOREIGN KEY (song_id) REFERENCES songs (id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
    pgm.dropTable('playlistsongs');
};
