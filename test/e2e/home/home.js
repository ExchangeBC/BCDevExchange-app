'use strict';

describe('Homepage', function() {

    beforeEach(function() {
        browser.get('#/home');
    });



    it('should have BC Developers\' Exchange in the header', function() {
        var h1 = element(by.tagName('h1'));
        expect(h1.getText()).toBe('BC Developers\' Exchange');
    });

});
