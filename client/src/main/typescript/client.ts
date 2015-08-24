/// <reference path="../../../typings/angularjs/angular.d.ts"/>
/// <reference path="../../../typings/angularjs/angular-route.d.ts"/>
/// <reference path="../../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../../typings/moment/moment.d.ts"/>
/// <reference path="../../../../server/api/src/main/typescript/api.d.ts"/>

const MODULE_NAME = "timesheetModule" 

angular.module(MODULE_NAME, ["angular-search-box", "angular-loading-bar", "chart.js", "ngRoute", "sticky", "ui.utils.masks"])

angular.module(MODULE_NAME).config(["$routeProvider", function($routeProvider: angular.route.IRouteProvider) {
	$routeProvider.when("/timesheets/:start", {
		templateUrl: "timesheet.html"
	}).otherwise({
		redirectTo: `/timesheets/${moment().format("YYYY-MM-DD")}`
	})
}])

interface IRouteScope extends angular.IScope {
	$route: angular.route.IRouteService
}

angular.module(MODULE_NAME).controller("routeController", ["$route", "$scope", function($route: angular.route.IRouteService, $scope: IRouteScope) {
	$scope.$route = $route
}])

interface ITimesheetScope extends angular.IScope {
	timesheet: api.ITimesheetResource
	initialize(): void
	saveEntryCell($event: IAngularEvent, projectRow: api.IProjectRow, taskRow: api.ITaskRow, entryCell: api.IEntryCell): void
	
	settingUp: boolean
	toggleSetup($event: angular.IAngularEvent): void
	
	labels: string[]
	data: number[]
	visible: boolean
	updateChart(): void
	toggleChartVisibility($event: angular.IAngularEvent): void	
	
	projectNameSubstring: string
	filteringProjectRow: boolean
	filterProjectRow(projectRow: api.IProjectRow): boolean

	taskNameSubstring: string
	filteringTaskRow: boolean
	filterTaskRow(taskRow: api.ITaskRow): boolean	
}

interface IAngularEvent extends angular.IAngularEvent {
	originalEvent: KeyboardEvent
}

angular.module(MODULE_NAME).controller("timesheetController", ["$http", "$route", "$scope", function($http: angular.IHttpService, $route: angular.route.IRouteService, $scope: ITimesheetScope) {
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
		
	$scope.saveEntryCell = function($event, projectRow, taskRow, entryCell) {
		const ENTER_KEY_CODE = 13
		if ($event.originalEvent.keyCode == ENTER_KEY_CODE) {
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
		
	$scope.toggleSetup = function($event) {
		$event.preventDefault()
		$scope.settingUp = !$scope.settingUp
	}	

    $scope.filterProjectRow = function(projectRow) { 
		if ($scope.settingUp || !projectRow.hidden) {
	        if ($scope.filteringProjectRow && $scope.projectNameSubstring) {
    	        return projectRow.project.name.toLowerCase().indexOf($scope.projectNameSubstring.toLowerCase()) >= 0
			} else {
				return true
			}	
		} else {
			return false
		}
    }

    $scope.filterTaskRow = function(taskRow) {
		if ($scope.settingUp || !taskRow.hidden) {
        	if ($scope.filteringTaskRow && $scope.taskNameSubstring) {
				return taskRow.task.name.toLowerCase().indexOf($scope.taskNameSubstring.toLowerCase()) >= 0
			} else {
				return true
			}
		} else {
			return false
		}		
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

	$scope.$on("$routeChangeSuccess", function(angularEvent, current, previous) {
		function hasOriginalPath(route: any): boolean {
			return route && route.$$route && route.$$route.originalPath
		}

        if (hasOriginalPath(current) && hasOriginalPath(previous)) {
            if (current.$$route.originalPath === previous.$$route.originalPath) {
				$scope.initialize()
            }
        }
	})

	$scope.initialize()
}])