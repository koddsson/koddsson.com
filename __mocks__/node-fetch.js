let fetch = jest.genMockFromModule('node-fetch');

fetch = function(url, options) {
  return {
    json: function() {
      if (options.headers.Authorization === 'VALID') {
        return {me: 'https://koddsson.com/'}
      } else {
        return {me: null}
      }
    }
  }
}

module.exports = fetch;
