var searchApp = angular.module("search");

SERVICE_URL = "http://localhost:555/restnode.io/service/i/search/gen/__DB__/__COLL__/__QPARAM__";
COLLECTION_DISC_URL = "http://localhost:555/restnode.io/service/i/search/colls/__DB__/";
AUTH = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJlc3R1c2VyIiwiaWF0IjoxNTY3NTk4MTk4LCJleHAiOjE1NzUzNzQxOTh9.pz30MIjJQXWrBeAtsBSCtbmTYEqUhJ92aAFVdsUfJh8";

searchApp.controller("searchCtrl", ["$scope", "ServiceConsumer", ($scope, ServiceConsumer) => {

	$scope.root = {
		db: 'EPODS',
		query: '',
		sources: [],
		result: {},
		sourcefilter: {},
		selectAllorNone: true
	};

	$scope.encodeForDownload = (val) => {
		return encodeURIComponent(JSON.stringify(val));
	};

	$scope.discovery = () => {
		let discUrl = COLLECTION_DISC_URL.replace('__DB__', $scope.root.db);

		ServiceConsumer.consume(discUrl, AUTH, (d) => {
			$scope.root.sources = d.data;
			if ($scope.root.sources) {
				$scope.root.sources.forEach((src) => {
					$scope.root.sourcefilter[src] = $scope.root.selectAllorNone && true;
				});
			}
		});
	};

	$scope.$watch('root.selectAllorNone', (newVal) => {
		for (let k in $scope.root.sourcefilter) {
			$scope.root.sourcefilter[k] = newVal;
		}
	}, true);

	$scope.$watch('root.db', () => {
		$scope.discovery();
	}, true);

	$scope.isEnter = (keyEvent) => {
		if (keyEvent.key == 'Enter') {
			$scope.search();
		}
	};

	$scope.search = () => {
		$scope.root.result = {};
		let qparam = $scope.root.query;
		if (qparam == "") {
			return;
		}
		for (let i in $scope.root.sources) {
			let collName = $scope.root.sources[i];
			if ($scope.root.sourcefilter[collName]) {
				let url = SERVICE_URL.replace('__DB__', $scope.root.db).replace('__COLL__', collName).replace('__QPARAM__', qparam);
				ServiceConsumer.consume(url, AUTH, (d) => {
					$scope.root.result[collName] = [];
					if (d.data && d.data.length > 0) {
						$scope.root.result[collName] = d.data;
					}
				});
			} else {
				$scope.root.result[collName] = [];
			}
		}
	};

}]);