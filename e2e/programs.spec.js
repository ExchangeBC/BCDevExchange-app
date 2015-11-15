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
'use strict'

describe('Resources', function () {

    beforeEach(function () {
        browser.get('/programs')
    })

    it('should have one or more resources present', function () {
        var resources = element.all(by.repeater('program in filtered'))
        expect(resources.count()).toBeGreaterThan(0)
    })
    
    it('should filter resources by keyword', function () {
        element(by.model('query')).sendKeys('bc laws')
        browser.sleep(1000) // wait for angular finishing manipulate DOM
        element.all(by.repeater('program in filtered')).then(function (rcs) {
            expect(rcs.length).toEqual(1)
            expect(rcs[0].getText()).toContain('BC Laws')
        })
    })

    it('should reset filter options when the reset button is clicked', function () {
        var searchBox = element(by.model('query'))
        searchBox.sendKeys('just a test').then(function () {
            element(by.css('input[type="reset"]')).click().then(function () {
                expect(searchBox.getText()).toEqual('')
            })
        })
    })
})