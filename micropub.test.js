const request = require('supertest');
const app = require('./micropub')

describe('GET', () => {
  test('/', (done) => {
    request(app).get('/').then((response) => {
      expect(response.statusCode).toBe(404);
      done();
    });
  });
  test('/?q=config', (done) => {
    request(app).get('/?q=config').then((response) => {
      expect(response.statusCode).toBe(200);
      done();
    });
  });
})

describe('POST', () => {
  describe('unauthorized', () => {
    test('/', (done) => {
      request(app).post('/').send(null).then((response) => {
        expect(response.statusCode).toBe(401);
        done();
      });
    });
  })

  describe('authorized', () => {
    beforeEach(() => {
      this.request = request(app).post('/').set({Authorization: 'VALID'})
    })

    test('/ with no body', (done) => {
      this.request.send(null).then((response) => {
        expect(response.statusCode).toBe(404);
        done();
      });
    });

    test('/ with a nonsense body', (done) => {
      this.request.send({foo: 'bar'}).then((response) => {
        expect(response.statusCode).toBe(404);
        done();
      });
    });

    test('like-of post', (done) => {
      this.request.send({"like-of": 'https://very-cool-url.pizza'}).then((response) => {
        expect(response.statusCode).toBe(201);
        done();
      });
    });
    
    test('note', (done) => {
      this.request.send({"h": "entry", content: "Very cool tweet"}).then((response) => {
        expect(response.statusCode).toBe(201);
        done();
      });
    });
    
    test('note with photo', (done) => {
      this.request.send({"type": "h-entry", "properties": {"photo": [{value: "https://koddsson.com/me.jpg", alt: "Cool dude"}], "content": ["Very cool photo"]}}).then((response) => {
        expect(response.statusCode).toBe(201);
        done();
      });
    });
  })
})
