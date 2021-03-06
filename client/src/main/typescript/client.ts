/// <reference path="../../../typings/angularjs/angular.d.ts"/>
/// <reference path="../../../typings/angular-local-storage/angular-local-storage.d.ts"/>
/// <reference path="../../../typings/angularjs/angular-route.d.ts"/>
/// <reference path="../../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../../typings/moment/moment.d.ts"/>
/// <reference path="../../../../server/api/src/main/typescript/api.d.ts"/>

const MODULE_NAME = "timesheetModule" 

angular.module(MODULE_NAME, ["angular-search-box", "angular-loading-bar", "chart.js", "LocalStorageModule", "ngRoute", "sticky", "ui.utils.masks"])

angular.module(MODULE_NAME).config(["$routeProvider", function($routeProvider: angular.route.IRouteProvider) {
	$routeProvider.when("/users/:userId/timesheets/:start", {
		templateUrl: "timesheet.html"
	}).otherwise({
		redirectTo: `/users/me/timesheets/${moment().format("YYYY-MM-DD")}`
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
	
	getProjectRowState(projectRow: api.IProjectRow): IRowState
	toggleProjectRowVisibility($event: IAngularEvent, projectRow: api.IProjectRow): void		
	
	getTaskRowState(projectRow: api.IProjectRow, taskRow: api.ITaskRow): IRowState
	toggleTaskRowVisibility($event: IAngularEvent, projectRow: api.IProjectRow, taskRow: api.ITaskRow): void

	chartLabels: string[]
	chartData: number[]
	chartVisible: boolean
	updateChart(): void	
	toggleChartVisibility($event: angular.IAngularEvent): void	
	
	projectNameSubstring: string
	filteringProjectRow: boolean
	filterProjectRow(projectRow: api.IProjectRow): boolean

	taskNameSubstring: string
	filteringTaskRow: boolean
	filterTaskRow(projectRow: api.IProjectRow): (taskRow: api.ITaskRow) => boolean	
}

interface IAngularEvent extends angular.IAngularEvent {
	originalEvent: KeyboardEvent
}

interface IRowState {
	visible: boolean
}

angular.module(MODULE_NAME).controller("timesheetController", ["$http", "localStorageService", "$location", "$route", "$scope", function($http: angular.IHttpService, localStorageService: angular.local.storage.ILocalStorageService, $location: angular.ILocationService, $route: angular.route.IRouteService, $scope: ITimesheetScope) {
	const BASE_URL = "http://localhost:8080"
	$scope.initialize = function() {
		$http<api.ITimesheetResource>({
			method: "GET",
			url: `${BASE_URL}${$location.url()}`
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
					id: projectRow.id,
					taskRows: [{
						id: taskRow.id,
						entryCells: [entryCell]
					}]
				}]
			}
			$http({
				method: "PATCH",
				url: `${BASE_URL}${$scope.timesheet._links["self"].href}`,
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
	
	function getRowState(key: string): IRowState {
		var state = <IRowState> localStorageService.get(key)
		if (!state) {
			state = {
				visible: true
			}
			localStorageService.set(key, state)
		}
		return state
	}

	function setRowState(key: string, state: IRowState): void {
		localStorageService.set(key, state)
	}
	
	function toggleRowVisibility($event: angular.IAngularEvent, key: string): void {
		$event.preventDefault()
		
		var state = getRowState(key)
		state.visible = !state.visible
		setRowState(key, state)
	}
	
	function getProjectRowKey(projectRow: api.IProjectRow): string {
		return JSON.stringify(projectRow.id)
	}

	$scope.getProjectRowState = function(projectRow) {
		return getRowState(getProjectRowKey(projectRow))
	}
	
	$scope.toggleProjectRowVisibility = function($event, projectRow) {
		toggleRowVisibility($event, getProjectRowKey(projectRow))
	}

	function getTaskRowKey(projectRow: api.IProjectRow, taskRow: api.ITaskRow): string {
		return JSON.stringify([projectRow.id, taskRow.id])
	}

	$scope.getTaskRowState = function(projectRow, taskRow) {
		return getRowState(getTaskRowKey(projectRow, taskRow))
	}
	
	$scope.toggleTaskRowVisibility = function($event, projectRow, taskRow) {
		toggleRowVisibility($event, getTaskRowKey(projectRow, taskRow))
	}

    $scope.filterProjectRow = function(projectRow) { 
		if ($scope.settingUp || $scope.getProjectRowState(projectRow).visible) {
	        if ($scope.filteringProjectRow && $scope.projectNameSubstring) {
    	        return projectRow.projectName.toLowerCase().indexOf($scope.projectNameSubstring.toLowerCase()) >= 0
			} else {
				return true
			}	
		} else {
			return false
		}
    }

    $scope.filterTaskRow = function(projectRow: api.IProjectRow) {
		return function(taskRow: api.ITaskRow): boolean {
			if ($scope.settingUp || $scope.getTaskRowState(projectRow, taskRow).visible) {
	        	if ($scope.filteringTaskRow && $scope.taskNameSubstring) {
					return taskRow.taskName.toLowerCase().indexOf($scope.taskNameSubstring.toLowerCase()) >= 0
				} else {
					return true
				}
			} else {
				return false
			}		
		}
    }
	
	$scope.updateChart = function() {
		$scope.chartLabels = _.map($scope.timesheet.projectRows, function(projectRow) {
			return projectRow.projectName
		})

		$scope.chartData = []
		_.forEach($scope.timesheet.projectRows, function(projectRow) {
			var time = 0
			_.forEach(projectRow.taskRows, function(taskRow) {
				_.forEach(taskRow.entryCells, function(entryCell) {
					time += entryCell.time					
				})
			})
			$scope.chartData.push(time)
		})
	}
	
	$scope.toggleChartVisibility = function($event) {
		$event.preventDefault()
		
		$scope.chartVisible = !$scope.chartVisible 		
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