import config  from './jest.config.js';

export default Object.assign({}, config, {
  transformIgnorePatterns: ['dist', 'node_modules'],
});
