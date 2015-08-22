/// <reference path="../../../typings/angularjs/angular.d.ts"/>
/// <reference path="../../../typings/angularjs/angular-route.d.ts"/>
/// <reference path="../../../typings/moment/moment.d.ts"/>
/// <reference path="../../../../server/api/src/main/typescript/api.d.ts"/>

let timesheetModule = angular.module("timesheetModule", ["angular-loading-bar", "ngRoute", "sticky"])

timesheetModule.config(["$routeProvider", function($routeProvider: angular.route.IRouteProvider) {
	$routeProvider.when("/timesheets/:start", {
		templateUrl: "timesheet.html",
		controller: "timesheetController"
	}).otherwise({
		redirectTo: "timesheets/" + moment().format("YYYY-MM-DD")
	})
}])

interface ITimesheetScope {
	timesheet: api.ITimesheet
}

timesheetModule.controller("timesheetController", ["$http", "$routeParams", "$scope", function($http: angular.IHttpService, $routeParams: angular.route.IRouteParamsService, $scope: ITimesheetScope) {
	$http<api.ITimesheet>({
		method: "GET",
		url: `http://localhost:8080/timesheets/${$routeParams["start"]}`
	}).then(function(response) {
		$scope.timesheet = response.data
	})
}])