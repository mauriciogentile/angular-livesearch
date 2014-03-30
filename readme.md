live-search
===========

###Usage
```js
$(function() {
	//setup
	$("#qsearch").liveSearch({
		displayProperty: "FullName",
		valueProperty: "FullName",
		searchCallback: mySearchCallback
	});
});

//the function that performs the search
var mySearchCallback = function (params) {
	var result = [];

	params.query = params.query.toLocaleLowerCase();

	var search = function() {
		for (var i = 0; i < cities.length; i++) {;
			var city = cities[i];
			if(city.City.toLocaleLowerCase().indexOf(params.query) > -1) {
				city.FullName = city.City + " (" + city.Country + ")";
				result.push(city);
			}
		};
		params.doneCallback.call(this, result);
	};

	search();
};
```