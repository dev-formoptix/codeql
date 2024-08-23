const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = require('chai');
const app = require('./index'); // Assuming the original code is exported from index.js

chai.use(chaiHttp);

describe('POST /alter-table', function () {
    it('should alter or create a table successfully', function (done) {
        chai
            .request(app)
            .post('/alter-table')
            .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.text).to.equal('Table altered or created successfully');
                done();
            });
    });

    it('should return an error if there was an issue altering the table', function (done) {
        chai
            .request(app)
            .post('/alter-table')
            .end(function (err, res) {
                expect(res).to.have.status(500);
                expect(res.text).to.equal('Error altering table');
                done();
            });
    });
});

describe('POST /upload', function () {
    it('should upload a file successfully', function (done) {
        chai
            .request(app)
            .post('/upload')
            .attach('file', './uploads/test.jpg')
            .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.text).to.equal('File uploaded: test.jpg');
                done();
            });
    });

    it('should return an error if no file is selected', function (done) {
        chai
            .request(app)
            .post('/upload')
            .end(function (err, res) {
                expect(res).to.have.status(400);
                expect(res.text).to.equal('No file selected!');
                done();
            });
    });

    it('should return an error if an invalid file type is uploaded', function (done) {
        chai
            .request(app)
            .post('/upload')
            .attach('file', './uploads/test.txt')
            .end(function (err, res) {
                expect(res).to.have.status(400);
                expect(res.text).to.equal('Error: Invalid file type!');
                done();
            });
    });
});