import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/main.js',
  format: 'umd',
  dest: 'dist/http-client.umd.js',
  moduleName: 'http-client',
  plugins: [babel()],
};
