var searchApp = angular.module("search", []);

searchApp.config(["$compileProvider", ($compileProvider) => {
	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob|chrome-extension|data|local):/);
}]);

searchApp.factory("ServiceConsumer", ($http, $q) => {
	return {
		consume: (_url, _auth, _successCb, _errorCb) => {
			var def = $q.defer();
			var headers = {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Credentials': 'true',
				'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
				'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + _auth
			};

			var request = {
				'url': _url,
				'headers': headers,
				'method': "GET"
			};
			$http(request).then((data) => {
				_successCb(data);
				def.resolve(data);
			},
			(data) => {
				_errorCb(data);
				def.reject(data);
			});
			return def.promise;
		}
	}
});