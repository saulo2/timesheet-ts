/// <reference path="../../../typings/any-db/any-db.d.ts"/>
/// <reference path="../../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../../typings/moment/moment-node.d.ts"/>
/// <reference path="../../../typings/q/Q.d.ts"/>
/// <reference path="../../../typings/restify/restify.d.ts"/>
/// <reference path="../../../../api/src/main/typescript/api.d.ts"/>

import anyDB = require("any-db")
import _ = require("lodash")
import moment = require("moment")
import q = require("q")
import restify = require("restify")

let pool = anyDB.createPool("postgres://timesheet:timesheet@localhost:5432/timesheet", null)

function query<Row>(text: string, params?: any[]): q.IPromise<Row[]> {
    let d = q.defer()
    pool.query(text, params, function(error, result) {
        if (error) {
            d.reject(error)
        } else {
            d.resolve(result.rows)
        }
    })
    return d.promise
}

interface IProjectRecord {
    id: number
    name: string
}

function getProjects(): q.IPromise<IProjectRecord[]> {
    return query(`
        select * 
          from PROJECT
    `)
}

interface ITaskRecord {
    id: number
    name: string
}

interface IProjectIdTask extends ITaskRecord {
    project_id: number
}

function getProjectIdTasks(): q.IPromise<_.Dictionary<ITaskRecord[]>> {
    return query<IProjectIdTask>(`
        select PROJECT_TASK.PROJECT_ID, TASK.* 
          from PROJECT_TASK join TASK on PROJECT_TASK.TASK_ID = TASK.ID
    `).then(function(projectIdTasks) {
        return _.mapValues(_.groupBy(projectIdTasks, function(projectIdTask) {
            return projectIdTask.project_id
        }), function(projectIdTasks) {
            return _.map(projectIdTasks, function(projectIdTask) {
                return {
                    id: projectIdTask.id,
                    name: projectIdTask.name
                }
            })
        })
    })
}

interface IEntryRecord {
    project_id: number
    task_id: number
    date: Date
    time: string    
}

function getEntries(start: Date, end: Date): q.IPromise<IEntryRecord[]> {
    return query(`
        select * 
          from ENTRY
         where DATE between '${moment.utc(start).format("YYYY-MM-DD")}' 
                        and '${moment.utc(end).format("YYYY-MM-DD")}'
    `)      
}

function getTimesheet<Timesheet extends api.ITimesheet>(start: Date, days: number): q.IPromise<Timesheet> {
    let dates = Array<Date>()
    for (let i = 0; i < days; ++i) {
        dates.push(moment.utc(start).add(i, "days").toDate())
    }
    let end = _.last(dates)
    return q.all<Object>([getProjects(), getProjectIdTasks(), getEntries(start, end)]).then(function(ps) {
        let projects = <IProjectRecord[]> ps[0]
        let projectIdTasks = <_.Dictionary<ITaskRecord[]>> ps[1]
        let entryRows = <IEntryRecord[]> ps[2] 
        return {
            dates: dates,
            projectRows: _.map(projects, function(project) {
                return {
                    project: project,
                    taskRows: _.map(projectIdTasks[project.id], function(task) {
                        return {
                            task: task,
                            entryCells: _.map(dates, function(date, index) {
                                let formattedDate = moment(date).format("YYYY-MM-DD")
                                let entryRow = _.find(entryRows, function(entryRow) {
                                    return entryRow.project_id === project.id
                                        && entryRow.task_id === task.id
                                        && moment(entryRow.date).format("YYYY-MM-DD") === formattedDate
                                })
                                return {
                                    column: index,
                                    time: entryRow ? parseFloat(entryRow.time) : null
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}

let server = restify.createServer()
server.use(restify.queryParser())
server.use(restify.CORS())

server.get("/timesheets/:start", function(req, res, next) {
    let start = moment.utc(req.params.start)
    let days = req.query.days ? parseInt(req.query.days) : 7
    getTimesheet<api.ITimesheetResource>(start.toDate(), days).then(function(timesheetResource) {
        timesheetResource._links = {
            self: {
                href: `/timesheets/${start.format("YYYY-MM-DD")}`
            },
            previous: {
                href: `/timesheets/${moment.utc(start).subtract(days, "days").format("YYYY-MM-DD")}`
            },
            next: {
                href: `/timesheets/${moment.utc(start).add(days, "days").format("YYYY-MM-DD")}`
            }
        }
        res.send(timesheetResource)
    }, function(error) {
        res.send(500, error)
    })                   
    return next() 
})

server.listen(8080)