/// <reference path="../../../typings/angularjs/angular.d.ts"/>
/// <reference path="../../../typings/angularjs/angular-route.d.ts"/>
/// <reference path="../../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../../typings/moment/moment.d.ts"/>
/// <reference path="../../../../server/api/src/main/typescript/api.d.ts"/>

let timesheetModule = angular.module("timesheetModule", ["angular-loading-bar", "chart.js", "ngRoute", "sticky", "ui.utils.masks"])

timesheetModule.config(["$routeProvider", function($routeProvider: angular.route.IRouteProvider) {
	$routeProvider.when("/timesheets/:start", {
		templateUrl: "timesheet.html"
	}).otherwise({
		redirectTo: `/timesheets/${moment().format("YYYY-MM-DD")}`
	})
}])

interface IRouteScope extends angular.IScope {
	$route: angular.route.IRouteService
}

timesheetModule.controller("routeController", ["$route", "$scope", function($route: angular.route.IRouteService, $scope: IRouteScope) {
	$scope.$route = $route
}])

interface ITimesheetScope extends angular.IScope {
	timesheet: api.ITimesheetResource
	initialize(): void

	labels: string[]
	data: number[]
	visible: boolean
	updateChart(): void
	toggleChartVisibility($event: angular.IAngularEvent): void	
	
	saveEntryCell($event: IAngularEvent, projectRow: api.IProjectRow, taskRow: api.ITaskRow, entryCell: api.IEntryCell): void	
}

interface IAngularEvent extends angular.IAngularEvent {
	originalEvent: KeyboardEvent
}

timesheetModule.controller("timesheetController", ["$http", "$route", "$scope", function($http: angular.IHttpService, $route: angular.route.IRouteService, $scope: ITimesheetScope) {
	$scope.initialize = function() {
		$http<api.ITimesheetResource>({
			method: "GET",
			url: `http://localhost:8080/timesheets/${$route.current.params["start"]}`,
			params: $route.current.params
		}).then(function(response) {
			$scope.timesheet = response.data
			$scope.updateChart()
		})
	}
	
	$scope.updateChart = function() {
		$scope.labels = _.map($scope.timesheet.projectRows, function(projectRow) {
			return projectRow.project.name
		})

		$scope.data = []
		_.forEach($scope.timesheet.projectRows, function(projectRow) {
			var time = 0
			_.forEach(projectRow.taskRows, function(taskRow) {
				_.forEach(taskRow.entryCells, function(entryCell) {
					time += entryCell.time					
				})
			})
			$scope.data.push(time)
		})
	}
	
	$scope.toggleChartVisibility = function($event) {
		$event.preventDefault()
		$scope.visible = !$scope.visible 		
	}
	
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
				$scope.updateChart()
				let target = <HTMLElement> $event.originalEvent.target				
				target.blur()
			}).catch(function(response) {
				console.log(response)
			})
		}
	}

    $scope.$on("$routeChangeSuccess", function(event, nextRoute, lastRoute) {
        if (lastRoute
				&& lastRoute.$$route
				&& lastRoute.$$route.originalPath 
				&& nextRoute
				&& nextRoute.$$route
				&& nextRoute.$$route.originalPath) {
            if (lastRoute.$$route.originalPath === nextRoute.$$route.originalPath) {
				$scope.initialize()
            }
        }
    })

	$scope.initialize()
}])