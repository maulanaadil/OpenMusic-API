require('dotenv').config();

const Hapi = require('@hapi/hapi');
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongValidator = require('./validator/songs');
const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const songsService = new SongsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
      const { response } = request;

      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      // jika bukan ClientError, lanjutkan dengan response sebelumnya (tanpa terintervensi)
      return response.continue || response;
  });



  await server.register({
    plugin: songs,
    options: {
      service: songsService,
      validator: SongValidator,
    },
  });


  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
