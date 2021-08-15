const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
    constructor(collaborationsService, cacheService) {
        this._pool = new Pool();
        this._collaborationsService = collaborationsService;
        this._cacheService = cacheService;
    }

    async addPlaylist({
        name, owner,
    }) {
        const id = `playlist-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
            values: [id, name, owner],
        };

        const result = await this._pool.query(query);
        if (!result.rows[0].id) {
            throw new InvariantError('Playlist gagal ditambahkan');
        }
        return result.rows[0].id;
    }

    async getPlaylists(owner) {
        const query = {
            text: `SELECT playlists.id, playlists.name, users.username 
                    FROM playlists
                    LEFT JOIN users ON playlists.owner = users.id
                    LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
                    WHERE playlists.owner = $1 OR collaborations.user_id = $1
                    GROUP BY playlists.id, users.username`,
            values: [owner],
        };
        const result = await this._pool.query(query);
        return result.rows;
    }

    async deletePlaylistById(id) {
        const query = {
            text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
            values: [id],
        };
        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new InvariantError('Playlist gagal dihapus. Id tidak ditemukan');
        }
    }

    async verifyPlaylistOwner(id, owner) {
        const query = {
            text: 'SELECT * FROM playlists WHERE id = $1',
            values: [id],
        };
        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }

        const playlist = result.rows[0];
        if (playlist.owner !== owner) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
    }

    async addSongToPlaylist(playlistId, songId) {
        const id = `playlistsong-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistId, songId],
        };
        const result = await this._pool.query(query);
        if (!result.rows[0].id) {
            throw new InvariantError('Lagu gagal ditambahkan kedalam playlist.');
        }
        await this._cacheService.delete(`playlist:${playlistId}`);
        return result.rows[0].id;
    }

    async getSongsFromPlaylist(playlistId) {
        try {
            const result = await this._cacheService.get(`playlist:${playlistId}`);
            return JSON.parse(result);
        } catch (error) {
            const query = {
                text: `SELECT s.id, s.title, s.performer
                    FROM playlistsongs p
                    JOIN songs s on s.id = p.song_id
                    WHERE p.playlist_id = $1
                    GROUP BY p.song_id, s.id`,
                values: [playlistId],
            };

            const result = await this._pool.query(query);
            await this._cacheService.set(`playlist:${playlistId}`, JSON.stringify(result));
            return result.rows;
        }
    }

    async deleteSongFromPlaylist(playlistId, songId) {
        const query = {
            text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
            values: [playlistId, songId],
        };

        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new InvariantError('Lagu didalam playlist gagal dihapus. Id tidak ditemukan');
        }

        await this._cacheService.delete(`playlist:${playlistId}`);
    }

    async verifyPlaylistAccess(playlistId, userId) {
        try {
            await this.verifyPlaylistOwner(playlistId, userId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            try {
                await this._collaborationsService.verifyCollaborator(playlistId, userId);
            } catch {
                throw error;
            }
        }
    }
}

module.exports = PlaylistsService;
