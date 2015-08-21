/// <reference path="../../../typings/any-db/any-db.d.ts"/>
/// <reference path="../../../typings/lodash/lodash.d.ts"/>
/// <reference path="../../../typings/moment/moment-node.d.ts"/>
/// <reference path="../../../typings/q/Q.d.ts"/>
/// <reference path="../../../typings/restify/restify.d.ts"/>
import anyDB = require("any-db")
import _ = require("lodash")
import moment = require("moment")
import q = require("q")
import restify = require("restify")

let pool = anyDB.createPool("postgres://timesheet:timesheet@localhost:5432/timesheet", null)

function query<Row>(text: string, params?: any[]): q.IPromise<Row[]> {
    let d = q.defer<Row[]>()
    pool.query(text, params, function(error, result) {
        if (error) {
            d.reject(error)
        } else {
            d.resolve(<Row[]> result.rows)
        }
    })
    return d.promise
}

interface IProject {
    id: number
    name: string
    tasks: ITask[]
}

function getProjects(): q.IPromise<IProject[]> {
    return query(`
        select * 
          from PROJECT
    `)
}

interface ITask {
    id: number
    name: string
}

interface IProjectIdTask extends ITask {
    project_id: number
}

function getProjectIdTasks(): q.IPromise<_.Dictionary<ITask[]>> {
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

interface IEntryRow {
    project_id: number
    task_id: number
    date: Date
    time: string    
}

function getEntries(start: Date, end: Date): q.IPromise<IEntryRow[]> {
    return query(`
        select * 
          from ENTRY
         where DATE between '${moment.utc(start).format("YYYY-MM-DD")}' 
                        and '${moment.utc(end).format("YYYY-MM-DD")}'
    `)      
}

interface ITimesheet {
    dates: Date[]
    projectRows: IProjectRow[]    
}

interface IProjectRow {
    project: IProject
    taskRows: ITaskRow[]
}

interface ITaskRow {
    task: ITask
    entryCells: IEntryCell[]
}

interface IEntryCell {
    column: number
    time: number
}

function getTimesheet(start: Date, days: number): q.IPromise<ITimesheet> {
    let dates = Array<Date>()
    for (let i = 0; i < days; ++i) {
        dates.push(moment.utc(start).add(i, "days").toDate())
    }
    let end = _.last(dates)
    return q.all<Object>([getProjects(), getProjectIdTasks(), getEntries(start, end)]).then(function(ps) {
        let projects = <IProject[]> ps[0]
        let projectIdTasks = <_.Dictionary<ITask[]>> ps[1]
        let entryRows = <IEntryRow[]> ps[2] 
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
    let start = moment.utc(req.params.start).toDate()
    let days = req.query.days ? parseInt(req.query.days) : 7    
    getTimesheet(start, days).then(function(timesheet) {
        res.send(timesheet)
    }, function(error) {
        res.send(500, error)
    })                   
    return next() 
})

server.listen(8080)