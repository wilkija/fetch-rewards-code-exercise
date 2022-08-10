const { expect } = require('chai');
const chai = require('chai');
const chaiHTTP = require('chai-http');
const server = require('../server');

const should = chai.should();

const PORT = 'http://localhost:8000';

chai.use(chaiHTTP);

describe('API test', () => {
    
    // Test POST 'add' route with a single transaction
    //// Confirms 200 HTTP status
    ////// Confirms that the response is an object and matches the expected test response
    describe('POST /add route', () => {
        it('it should POST a new transaction to transactionHistory', (done) => {
            const testTransaction = { "payer": "DANNON", "points": 1000, "timestamp": "2020-11-02T14:00:00Z" };
            chai.request(PORT)
                .post('/api/add')
                .send(testTransaction)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    expect(res.body.transaction).to.deep.equal(testTransaction);
                done();
                });
        });
    });

    // Test POST 'spend' route with a single expenditure
    //// Confirms 200 HTTP status
    ////// Confirms that the response is an array and matches the expected test response
    describe("POST /spend route", () => {
        it("it should POST a new spending of points", (done) => {
          const testRequest = { "points":  500 }
          const testResponse  = [{ "payer": "DANNON", "points": -500 }]
          chai.request(PORT)
            .post("/api/spend")
            .send(testRequest)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('array');
              expect(res.body).to.deep.equal(testResponse)
            done();
            });
        });
      });

      // Test GET 'balance' route with the above two tests having run
      //// Confirms 200 HTTP status
      ////// Confirms that the response is an object and matches the expected test response
      describe('GET /balance route', () => {
        it('it should GET all the payer balances', (done) => {
            const testBalance = { "DANNON": 500 };
            chai.request(PORT)
                .get('/api/balance')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    expect(res.body).to.deep.equal(testBalance);
                done();
                });
        });
    });
});