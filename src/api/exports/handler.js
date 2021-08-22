class ExportsHandler {
    constructor(service, validator, playlistsService) {
        this._service = service;
        this._validator = validator;
        this._playlistsService = playlistsService;

        this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
    }

    async postExportPlaylistHandler(request, h) {
            this._validator.validateExportPlaylistPayload(request.payload);

            const { id: credentialId } = request.auth.credentials;
            const { playlistId } = request.params;

            await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

            const message = {
                playlistId,
                targetEmail: request.payload.targetEmail,
            };

            await this._service.sendMessage('export:playlists', JSON.stringify(message));

            const response = h.response({
               status: 'success',
                message: 'Permintaan Anda dalam antrean',
            });
            response.code(201);
            return response;
    }
}

module.exports = ExportsHandler;
