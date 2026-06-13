module.exports = {
  hamzatex: {
    input: {
      target: './openapi-spec.json',
    },
    output: {
      clean: true,
      mode: 'tags-split',
      target: 'src/api/generated',
      schemas: 'src/api/models',
      client: 'react-query',
      httpClient: 'axios',
      override: {
        mutator: {
          path: 'src/utils/axiosInstance.ts',
          name: 'axiosInstance',
        },
      },
    },
  },
};
