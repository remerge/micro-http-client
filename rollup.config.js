import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/main.js',
  format: 'umd',
  dest: 'dist/main.js',
  moduleName: 'http-client',
  plugins: [babel()],
};
