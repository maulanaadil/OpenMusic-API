class PlaylistsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
        this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
        this.deletePlaylistHandler = this.deletePlaylistHandler.bind(this);
        this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
        this.getSongsFromPlaylistHandler = this.getSongsFromPlaylistHandler.bind(this);
        this.deleteSongFromPlaylistByIdHandler = this.deleteSongFromPlaylistByIdHandler.bind(this);
    }

    async postPlaylistHandler(request, h) {
            this._validator.validatePostPlaylistPayload(request.payload);
            const { id: credentialId } = request.auth.credentials;
            const { name } = request.payload;

            const playlistId = await this._service.addPlaylist({ name, owner: credentialId });

            const response = h.response({
                status: 'success',
                message: 'Playlist berhasil ditambahkan',
                data: {
                    playlistId,
                },
            });
            response.code(201);
            return response;
    }

    async getPlaylistsHandler(request, h) {
            const { id: credentialId } = request.auth.credentials;

            const playlists = await this._service.getPlaylists(credentialId);
            const response = h.response({
                status: 'success',
                data: {
                    playlists,
                },
            });
            response.code(200);
            return response;
    }

    async deletePlaylistHandler(request) {
            const { id } = request.params;
            const { id: credentialId } = request.auth.credentials;

            await this._service.verifyPlaylistOwner(id, credentialId);
            await this._service.deletePlaylistById(id);

            return {
                status: 'success',
                message: 'Playlist berhasil dihapus',
            };
    }

    async postSongToPlaylistHandler(request, h) {
            this._validator.validatePostAddSongToPlaylistPayload(request.payload);
            const { playlistId } = request.params;
            const { songId } = request.payload;
            const { id: credentialId } = request.auth.credentials;

            await this._service.verifyPlaylistAccess(playlistId, credentialId);

            await this._service.addSongToPlaylist(playlistId, songId);
            const response = h.response({
                status: 'success',
                message: 'Lagu berhasil ditambahkan ke playlist',
                data: {
                    playlistId,
                },
            });
            response.code(201);
            return response;
    }

    async getSongsFromPlaylistHandler(request) {
            const { playlistId } = request.params;
            const { id: credentialId } = request.auth.credentials;

            await this._service.verifyPlaylistAccess(playlistId, credentialId);

            const songs = await this._service.getSongsFromPlaylist(playlistId);
            return {
                status: 'success',
                data: {
                    songs,
                },
            };
    }

    async deleteSongFromPlaylistByIdHandler(request) {
            const { playlistId } = request.params;
            const { songId } = request.payload;
            const { id: credentialId } = request.auth.credentials;

            await this._service.verifyPlaylistAccess(playlistId, credentialId);
            await this._service.deleteSongFromPlaylist(playlistId, songId);

            return {
                status: 'success',
                message: 'Lagu berhasil dihapus dari playlist',
            };
    }
}
module.exports = PlaylistsHandler;
