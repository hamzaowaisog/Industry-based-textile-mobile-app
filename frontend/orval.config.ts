import { defineConfig } from 'orval';

/**
 * Orval config — generates typed Axios API clients from the HamzaTex OpenAPI spec.
 *
 * Prerequisites (run once):
 *   yarn add axios
 *   yarn add -D orval
 *
 * Generate:
 *   yarn orval          (reads this file, fetches spec from running backend)
 *
 * Output layout (tags-split mode — one file per controller tag):
 *   src/api/auth.ts
 *   src/api/stockMovements.ts
 *   src/api/meta.ts
 *   src/api/products.ts
 *   ... etc
 *   src/api/model/         ← all TypeScript interfaces
 */
export default defineConfig({
  hamzatex: {
    input: {
      // Backend must be running for this URL to resolve.
      // Alternatively point at a downloaded swagger.json:
      //   target: './swagger.json',
      target: 'http://localhost:5000/swagger/v1/swagger.json',
    },
    output: {
      mode: 'tags-split',
      target: 'src/api',
      schemas: 'src/api/model',
      client: 'axios',
      baseUrl: 'http://localhost:5000',
      override: {
        // Use the shared Axios instance from src/utils/api.js
        // so interceptors (token injection, 401 refresh) apply automatically.
        mutator: {
          path: './src/utils/api.ts',
          name: 'apiInstance',
        },
      },
    },
  },
});
