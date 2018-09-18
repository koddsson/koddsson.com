const request = require('supertest');
const app = require('./notes')
const dbPromise = require('./data')
  
const legacyLinks = {
  '2018-08-25-0.html': 1535200649,
  '2018-08-23-0.html': 1535047453,
  '2018-08-22-1.html': 1534940871, 
  '2018-08-22-0.html': 1534934370,
  '2018-08-21.html': 1534870136,
}

describe('GET', () => {
  beforeAll(async () => {
    const db = await dbPromise
    await db.run(
      "INSERT INTO notes VALUES (?, ?)",
      Math.floor(new Date() / 1000),
      'Test note; please ignore'
    );
    for (const [slug, id] of Object.entries(legacyLinks)) {
      await db.run(
        "INSERT INTO notes VALUES (?, ?)",
        id,
        'Test note; please ignore'
      );
    }
  })

  test('/', (done) => {
    request(app).get('/').then((response) => {
      expect(response.statusCode).toBe(200);
      done();
    });
  });

  test('/a-note-that-doesnt-exitst', (done) => {
    request(app).get('/a-note-that-doesnt-exitst').then((response) => {
      expect(response.statusCode).toBe(404);
      done();
    });
  });

  test('/feed.xml', (done) => {
    request(app).get('/feed.xml').then((response) => {
      expect(response.statusCode).toBe(200);
      done();
    });
  });
  
  test('/1534870136', (done) => {
    request(app).get('/1534870136').then((response) => {
      expect(response.statusCode).toBe(200);
      done();
    });
  });

  for (const [slug, id] of Object.entries(legacyLinks)) {
    test(`/${slug}`, (done) => {
      request(app).get(`/${slug}`).then((response) => {
        expect(response.statusCode).toBe(301);
        expect(response.headers.location).toBe(`/notes/${id}`);
        done();
      });
    });
  }
});
