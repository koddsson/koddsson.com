const request = require('supertest');
const app = require('./app')
const getDB = require('./data')

describe('GET', () => {
  beforeAll(async () => {
    const slug = Math.floor(new Date() / 1000)
    const db = await getDB()
    await db.run(
      "INSERT INTO notes VALUES (?, ?, ?)",
      slug,
      'Post from app.test.js',
      null
    );
    await db.run(
      "INSERT INTO photos VALUES(?, ?, ?)",
      slug,
      "not-a-real-url",
      "It's not a real image"
    )
  })

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
