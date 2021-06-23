import ts from '@rollup/plugin-typescript'

export default {
  input: 'src/index.ts',
  output: [
    {
      dir: 'dist',
      format: 'esm'
    }
  ],
  plugins: [ts({ include: ['./src/**/*.ts'] })],
  external: ['crypto', '@tinyhttp/cookie', '@tinyhttp/cookie-signature']
}
