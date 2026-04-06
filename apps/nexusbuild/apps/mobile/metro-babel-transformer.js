const { transpile } = require('metro-react-native-babel-transformer');

module.exports.transform = function ({ src, filename, options }) {
  return transpile({ src, filename, options });
};