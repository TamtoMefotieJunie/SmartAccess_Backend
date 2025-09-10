const request = require('supertest');
const mongoose = require("mongoose");
const app = require('../api'); 


describe('POST /add-task', function() {
  it('Adds a task', function(done) {
    request(app)
      .post('/add-task')
      .send({ title: "API testing rocks!" })
      .expect(201, done);
  });
});

describe('GET /tasks', function() {
  it('List all tasks', function(done) {
    request(app)
      .get('/tasks')
      .expect(200, done);
  });
});

describe('GET /tasks/:id', function() {
  it('Gets a particular task', function(done) {
    // You'll need a real ID from your db.json after adding a task
    request(app)
      .get('/tasks/some-real-id-here') // 👈 Replace with a real ID
      .expect(200, done);
  });
});

describe('PUT /tasks/:id', function() {
  it('Updates a particular task', function(done) {
    request(app)
      .put('/tasks/some-real-id-here') // 👈 Replace with a real ID
      .send({ title: "Updated task" })
      .expect(200, done);
  });
});

describe('DELETE /tasks/:id', function() {
  it('Deletes a particular task', function(done) {
    request(app)
      .delete('/tasks/some-real-id-here') 
      .expect(200, done);
  });
});


describe('GET /allHospital', function() {
  it('should return a list of all hospitals', function(done) {
    request(app)
      .get('/allHospital')
      .expect('Content-Type', /json/) 
      .expect(200) 
      .end(function(err, res) {
        if (err) return done(err);
        if (!Array.isArray(res.body)) {
          return done(new Error('Expected response body to be an array'));
        }
        done();
      });
  });

  it('should return 404 if route does not exist', function(done) {
    request(app)
      .get('/allHospitalssss') 
      .expect(404, done);
  });
});


describe("GET /fetch/specialty/:id", () => {

  it("should return hospitals for a valid specialty ID", function(done) {
    const validSpecialtyId = "68ac66165df4c0d22adc5104"; // Use a real or mock ID string

    request(app)
      .get(`/fetch/specialty/${validSpecialtyId}`)
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.have.property("message");
        res.body.should.have.property("data").which.is.an("array");
        done(); // ✅ MUST call done()
      });
  });

  it("should return 400 for invalid ObjectId format", function(done) {
    request(app)
      .get("/fetch/specialty/12345") // Invalid ID
      .expect("Content-Type", /json/)
      .expect(400)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.have.property("error").eql("Invalid specialty ID format");
        done(); // ✅ MUST call done()
      });
  });

  it("should return 404 if specialty not found", function(done) {
    const nonExistentId = "ffffffffffffffffffffffff"; // Valid format, fake ID

    request(app)
      .get(`/fetch/specialty/${nonExistentId}`)
      .expect("Content-Type", /json/)
      .expect(404)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.have.property("error").eql("No hospitals found for this specialty");
        done(); // ✅ MUST call done()
      });
  });
});

describe('POST /login', function() {
  it('should login a user with valid credentials', function(done) {
    request(app)
      .post('/login')
      .send({
        email: 'lady2@gmail.com',
        password: 'lady2@123'     
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        if (!res.body.token && !res.body.user) {
          return done(new Error('Expected a token or user object in response'));
        }
        done();
      });
  });
  it('should return 401 for invalid credentials', function(done) {
    request(app)
      .post('/login')
      .send({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      })
      .expect(401, done);
  });
  it('should return 400 for missing email or password', function(done) {
    request(app)
      .post('/login')
      .send({ email: 'test@example.com' }) 
      .expect(400, done);
  });
});

describe('GET /', function() {
  it('should return a list of all roles', function(done) {
    request(app)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        if (!Array.isArray(res.body)) {
          return done(new Error('Expected response body to be an array'));
        }
        done();
      });
  });
});