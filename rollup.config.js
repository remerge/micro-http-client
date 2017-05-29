import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/main.js',
  format: 'umd',
  dest: 'dist/main.js',
  moduleName: 'micro-http-client',
  plugins: [babel()],
};
