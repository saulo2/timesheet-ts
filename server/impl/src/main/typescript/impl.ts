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

function query<Result>(text: string, params?: any[]): q.IPromise<Result> {
    console.log(text, params)
    let d = q.defer()
    pool.query(text, params, function(error, result) {
        if (error) {
            console.log(error)
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
    return query<IProjectIdTask[]>(`
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

function selectEntries(start: Date, end: Date): q.IPromise<IEntryRecord[]> {
    return query(`
        select * 
          from ENTRY
         where DATE between '${moment.utc(start).format("YYYY-MM-DD")}' 
                        and '${moment.utc(end).format("YYYY-MM-DD")}'
    `)
}

function entryCount(entry: IEntryRecord): q.IPromise<number> {
    return query(`
        select count(*)
          from ENTRY
         where PROJECT_ID = ${entry.project_id} and
               TASK_ID = ${entry.task_id} and
               DATE = '${moment.utc(entry.date).format("YYYY-MM-DD")}'
    `)
}

function insertEntry(entry: IEntryRecord): q.IPromise<void> {
    return query<void>(`
        insert into ENTRY (PROJECT_ID, TASK_ID, DATE, TIME) values (
            ${entry.project_id},
            ${entry.task_id},
            '${moment.utc(entry.date).format("YYYY-MM-DD")}',
            ${entry.time}
        )
    `)    
}

function updateEntry(entry: IEntryRecord): q.IPromise<void> {
    return query<void>(`
        update ENTRY
           set TIME = ${parseFloat(entry.time)}
         where PROJECT_ID = ${entry.project_id} and
               TASK_ID = ${entry.task_id} and
               DATE = '${moment.utc(entry.date).format("YYYY-MM-DD")}'
    `)
}

function saveEntry(entry: IEntryRecord): q.IPromise<void> {
    return entryCount(entry).then(function(entryCount) {
        return entryCount ? insertEntry(entry) : updateEntry(entry)
    })
}

function getTimesheet<Timesheet extends api.ITimesheet>(start: Date, days: number): q.IPromise<Timesheet> {
    let dates = Array<Date>()
    for (let i = 0; i < days; ++i) {
        dates.push(moment.utc(start).add(i, "days").toDate())
    }
    let end = _.last(dates)
    return q.all<Object>([getProjects(), getProjectIdTasks(), selectEntries(start, end)]).then(function(ps) {
        let projects = <IProjectRecord[]> ps[0]
        let projectIdTasks = <_.Dictionary<ITaskRecord[]>> ps[1]
        let entries = <IEntryRecord[]> ps[2] 
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
                                let entryRow = _.find(entries, function(entry) {
                                    return entry.project_id === project.id
                                        && entry.task_id === task.id
                                        && moment(entry.date).format("YYYY-MM-DD") === formattedDate
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

function patchTimesheet(start: Date, timesheet: api.ITimesheet): q.IPromise<void> {
    let ps: q.IPromise<void>[] = []
    _.forEach(timesheet.projectRows, function(projectRow) {
        _.forEach(projectRow.taskRows, function(taskRow) {
            _.forEach(taskRow.entryCells, function(entryCell) {
                ps.push(saveEntry({
                    project_id: projectRow.project.id,
                    task_id: taskRow.task.id,
                    date: moment.utc(start).add(entryCell.column, "days").toDate(),
                    time: `${entryCell.time}`
                }))
            })
        })
    })
    return q.all(ps).then(function() {
    })
}

let server = restify.createServer()
server.use(restify.bodyParser())
server.use(restify.CORS())
server.use(restify.queryParser())

server.get("/timesheets/:start", function(req, res, next) {
    let start = moment.utc(req.params.start)
    let days = req.query.days ? parseInt(req.query.days) : 7
    getTimesheet<api.ITimesheetResource>(start.toDate(), days).then(function(timesheetResource) {
        timesheetResource._links = {
            self: {
                href: `/timesheets/${start.format("YYYY-MM-DD")}?days=${days}`
            },
            previous: {
                href: `/timesheets/${moment.utc(start).subtract(days, "days").format("YYYY-MM-DD")}?days=${days}`
            },
            next: {
                href: `/timesheets/${moment.utc(start).add(days, "days").format("YYYY-MM-DD")}?days=${days}`
            },
            plus: {
                href: `/timesheets/${start.format("YYYY-MM-DD")}?days=${days + 1}`
            },
        }
        if (days > 0) {
            timesheetResource._links["minus"] = {
                href: `/timesheets/${start.format("YYYY-MM-DD")}?days=${days - 1}`
            }
        }
        res.send(timesheetResource)
    }, function(error) {
        res.send(500, error)
    })
    return next()
})

server.patch("/timesheets/:start", function(req, res, next) {
    let start = moment.utc(req.params.start)
    patchTimesheet(start.toDate(), req.body).then(function() {
        res.send()
    }, function(error) {
        res.send(500, error)
    })
    return next()
})

server.listen(8080)