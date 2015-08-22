/// <reference path="../../../typings/angularjs/angular.d.ts"/>
/// <reference path="../../../typings/angularjs/angular-route.d.ts"/>
/// <reference path="../../../typings/moment/moment.d.ts"/>
/// <reference path="../../../../server/api/src/main/typescript/api.d.ts"/>

let timesheetModule = angular.module("timesheetModule", ["angular-loading-bar", "ngRoute", "sticky", "ui.utils.masks"])

timesheetModule.config(["$routeProvider", function($routeProvider: angular.route.IRouteProvider) {
	$routeProvider.when("/timesheets/:start", {
		templateUrl: "timesheet.html",
		controller: "timesheetController",
		resolve: {			
			timesheet: ["$http", "$route", function($http: angular.IHttpService, $route: angular.route.IRouteService) {
				return $http<api.ITimesheetResource>({
					method: "GET",
					url: `http://localhost:8080/timesheets/${$route.current.params["start"]}`,
					params: $route.current.params
				}).then(function(response) {
					return response.data
				})
			}]
		}		
	}).otherwise({
		redirectTo: `/timesheets/${moment().format("YYYY-MM-DD")}`
	})
}])

interface ITimesheetScope extends angular.IScope {
	timesheet: api.ITimesheetResource
	saveEntryCell($event: IAngularEvent, projectRow: api.IProjectRow, taskRow: api.ITaskRow, entryCell: api.IEntryCell): void
}

interface IAngularEvent extends angular.IAngularEvent {
	originalEvent: KeyboardEvent
}

timesheetModule.controller("timesheetController", ["$http", "$routeParams", "$scope", "timesheet", function($http: angular.IHttpService, $routeParams: angular.route.IRouteParamsService, $scope: ITimesheetScope, timesheet: api.ITimesheetResource) {
/*	
	$http<api.ITimesheetResource>({
		method: "GET",
		url: `http://localhost:8080/timesheets/${$routeParams["start"]}`,
		params: $routeParams
	}).then(function(response) {
		$scope.timesheet = response.data
	})
*/
	
	$scope.timesheet = timesheet

	$scope.saveEntryCell = function($event, projectRow, taskRow, entryCell) {		
		if ($event.originalEvent.keyCode == 13) {
			let timesheet = {
				projectRows: [{
					project: {
						id: projectRow.project.id
					},
					taskRows: [{
						task: {
							id: taskRow.task.id
						},
						entryCells: [entryCell]
					}]
				}]
			}
			$http({
				method: "PATCH",
				url: `http://localhost:8080${$scope.timesheet._links["self"].href}`,
				data: timesheet
			}).then(function(response) {
				let target = <HTMLElement> $event.originalEvent.target
				target.blur()
			}).catch(function(response) {
				console.log(response)
			})
		}
	}	
}])