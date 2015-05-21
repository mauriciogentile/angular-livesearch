describe('liveSearch directive', function() {
    var scope, liveSearch, _window, q, element, timeout;

    var makeSearchElement = function() {
        var extra_attributes = Array.prototype.join.call(arguments, " ");
        return angular.element('<div id="test-live-search">' +
               '<live-search id="search1" live-search-callback="mySearchCallback" live-search-display-property="city" ' +
                 'live-search-item-template="{{result.city}}<strong>{{result.state}}</strong><b>{{result.country}}</b>" ' +
                 'live-search-select="fullName" ' + extra_attributes + ' ng-model="search1">' +
               '</live-search>' +
            '</div>');
    }

    beforeEach(module('LiveSearch'));

    beforeEach(inject(function($rootScope, $compile, $q, $timeout) {
        scope = $rootScope;
        q = $q;
        timeout = $timeout;

        scope.mySearchCallback = function () {
            var defer = $q.defer();
            defer.resolve([
                { city: "nailuva", state: "ce", country: "fiji"},
                { city: "suva", state: "ce", country: "fiji"}
            ]);
            return defer.promise;
        };

        scope.search1 = "";

        element = $compile(makeSearchElement())(scope);
        scope.$digest();
    }));

    //cleanup DOM after
    afterEach(function() {
        var e = document.getElementsByClassName("searchresultspopup");
        for (var i = e.length; i != 0; --i) {
          e[0].remove();
        }
    });

    it('should replace live-search tag by input text', function() {
        var input = element.find("input");
        expect(input.length).toBe(1);
        expect(input.attr("type")).toBeDefined();
        expect(input.attr("type")).toBe("text");
    });

    it('should bind value to ngModel if present', function() {
        scope.$apply(function() {
            scope.search1 = "something"
        });

        var input = element.find("input");
        expect(scope.search1).toBe(input.val());
    });


    it('should add key handlers to the input element', function() {
        var input = element.find("input")[0];
        
        expect(input.onkeydown).toBeDefined();
        expect(input.onkeyup).toBeDefined();
    });

    it('should add invisble <ul> tag for results', function() {
        expect(document.getElementsByClassName("searchresultspopup").length).toBe(1);
    });

    it('should invoke search callback with search entry when key is up', function() {

        var input = angular.element(element.find("input")[0]);
        var defer = q.defer();
        spyOn(scope, "mySearchCallback").and.returnValue(defer.promise);
        defer.resolve([]);

        input.val("fiji");
        scope.$apply(function() {
            input[0].onkeyup({keyCode : "any"});
        });

        timeout.flush();

        expect(scope.mySearchCallback).toHaveBeenCalledWith({ query: input.val() });
    });

    it('should not invoke search callback if input length is less than 3', function() {
        var input = angular.element(element.find("input")[0]);

        input.val("fi");
        input[0].onkeyup({keyCode : "any"});
        timeout.flush();

        expect(angular.element(document.getElementsByClassName("searchresultspopup")).children().length).toBe(0);
    });

    it('should invoke search callback if liveSearchMaxlength not set', function() {
        var query = "nailuva ce fiji";
        var input = angular.element(element.find("input")[0]);

        input.val(query);
        input[0].onkeyup({keyCode : "any"});
        timeout.flush();

        expect(angular.element(document.getElementsByClassName("searchresultspopup")).children().length).toBe(2);
    });

    it('should invoke search callback if input length is less than or equal to than liveSearchMaxlength', inject(function($compile) {
        var query = "nailuva ce fiji";
        var max_len = query.length;
        element = $compile(makeSearchElement('live-search-maxlength="' + max_len.toString() + '"'))(scope);
        var input = angular.element(element.find("input")[0]);

        input.val(query);
        input[0].onkeyup({keyCode : "any"});
        timeout.flush();

        expect(angular.element(document.getElementsByClassName("searchresultspopup")).children().length).toBe(2);
    }));

    it('should not invoke search callback if input length is greater than liveSearchMaxlength', inject(function($compile) {
        var query = "nailuva ce fiji";
        var max_len = query.length - 1;
        element = $compile(makeSearchElement('live-search-maxlength="' + max_len.toString() + '"'))(scope);
        var input = angular.element(element.find("input")[0]);

        input.val(query);
        input[0].onkeyup({keyCode : "any"});
        timeout.flush();

        expect(angular.element(document.getElementsByClassName("searchresultspopup")).children().length).toBe(0);
    }));

    it('should have as many results as items in the search result', function() {
        var input = angular.element(element.find("input")[0]);

        input.val("fiji");
        scope.$apply(function() {
            input[0].onkeyup({keyCode : "any"});
        });

        timeout.flush();

        expect(angular.element(document.getElementsByClassName("searchresultspopup")).children().length).toBe(2);
    });

    it('should select the first element when keydown', function() {
        var input = angular.element(element.find("input")[0]);
        var ul = document.getElementsByClassName("searchresultspopup")[0];
        ul = angular.element(ul);
        input.val("fiji");
        input[0].onkeyup({keyCode : "any"});
        timeout.flush();
        input[0].onkeydown({keyCode : 40});
        
        expect(angular.element(ul.find("li")[0]).hasClass("selected")).toBe(true);
    });

    it('should select the last element when keyup', function() {
        var input = angular.element(element.find("input")[0]);
        input.val("fiji");
        input[0].onkeyup({keyCode : "any"});
        timeout.flush();
        var li = angular.element(document.getElementsByClassName("searchresultspopup")).find("li");
        input[0].onkeydown({keyCode : 38});
        
        expect(angular.element(li[0]).hasClass("selected")).toBe(true);
    });
});
