const request = require('supertest');
const app = require('./app')

describe('GET', () => {
  test('/', (done) => {
    request(app).get('/').then((response) => {
      expect(response.statusCode).toBe(200);
      done();
    });
  });

  test('/favorites', (done) => {
    request(app).get('/favorites').then((response) => {
      expect(response.statusCode).toBe(200);
      done();
    });
  });
});
