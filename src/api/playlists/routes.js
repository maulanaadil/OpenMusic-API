const routes = (handler) => [
    {
        method: 'POST',
        path: '/playlists',
        handler: handler.postPlaylistHandler,
        options: {
            auth: 'openmusicapp_jwt',
        },
    },
    {
        method: 'GET',
        path: '/playlists',
        handler: handler.getPlaylistsHandler,
        options: {
          auth: 'openmusicapp_jwt',
        },
    },
    {
        method: 'DELETE',
        path: '/playlists/{id}',
        handler: handler.deletePlaylistHandler,
        options: {
            auth: 'openmusicapp_jwt',
        },
    },
    {
        method: 'POST',
        path: '/playlists/{playlistId}/songs',
        handler: handler.postSongToPlaylistHandler,
        options: {
            auth: 'openmusicapp_jwt',
        },
    },
    {
        method: 'GET',
        path: '/playlists/{playlistId}/songs',
        handler: handler.getSongsFromPlaylistHandler,
        options: {
            auth: 'openmusicapp_jwt',
        },
    },
    {
        method: 'DELETE',
        path: '/playlists/{playlistId}/songs',
        handler: handler.deleteSongFromPlaylistByIdHandler,
        options: {
            auth: 'openmusicapp_jwt',
        },
    },
];

module.exports = routes;
