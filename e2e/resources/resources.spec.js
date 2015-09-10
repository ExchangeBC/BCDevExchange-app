'use strict';

describe('Resources', function() {

    beforeEach(function() {
        browser.get('#/resources');
    });

    it('should have one or more resources present', function() {
        var resources = element.all(by.repeater('resource in filtered')).count();
        var resourceCount;
        resources.then(function(count) {
            resourceCount = count;
        })
        .then(function() {
            expect(resources).toBeGreaterThan(0);
        });
    });

    it('should filter resources by keyword', function() {
        element(by.model('query')).sendKeys('bc laws api');
        var resources = element.all(by.repeater('resource in filtered'));
        resources.then(function(rcs) {
            expect(rcs.length).toEqual(1);
            expect(rcs[0].getText()).toContain('BC Laws API');
        });
    });

    it('should filter resources by source', function() {
        element(by.cssContainingText('span', 'Filter by source')).click();
        element(by.cssContainingText('a', 'BC Digital Resource Catalogue')).click();
        var resources = element.all(by.repeater('resource in filtered'));
        resources.then(function(rcs) {
            expect(rcs.length).toEqual(1);
            expect(rcs[0].getText()).toContain('BC Laws API');
        });
    });

    it('should reset filter options when the reset button is clicked', function() {
        var searchBox = element(by.model('query'));
        searchBox.sendKeys('just a test');
        element(by.css('input[type="reset"]')).click();
        expect(searchBox.getText()).toEqual('');
    });

});
