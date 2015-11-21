/*
 Copyright 2015 Province of British Columbia
 
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and limitations under the License.
 */

var Q = require('q')
var numbers = require('./numbers')
var db = require('../models/db')
describe('Search Twitter', function () {
    debugger
    beforeEach(function () {
        spyOn(db.Number.prototype, 'save').and.callFake(function (cb) {
            cb(null, {
                source: 'twitter',
                topic: '#BCDev',
                count: 0,
                _id: 'xx'
            })
        })
        spyOn(db, 'updateNumber').and.callFake(function (cb) {
            var deferred = Q.defer()
            deferred.resolve(null)
            return deferred.promise
        })
    })
    it('should work when db has no twitter record', function (done) {
        spyOn(db, 'getNumber').and.callFake(function () {
            var deferred = Q.defer()
            deferred.resolve(null)
            return deferred.promise
        })
        numbers.searchTwitter('#BCDev', function () {
            expect(db.Number.prototype.save.calls.count()).toEqual(1)
            done()
        })
    })
    it('should work when db has a twitter record', function (done) {
        spyOn(db, 'getNumber').and.callFake(function (query,cb) {
            var deferred = Q.defer()
            deferred.resolve({
                source: 'twitter',
                topic: '#BCDev',
                count: 0,
                _id: 'xx'
            })
            return deferred.promise.nodeify(cb)
        })
        numbers.searchTwitter('#BCDev', function () {
            expect(db.Number.prototype.save.calls.count()).toEqual(0)
            done()
        })
    })
})