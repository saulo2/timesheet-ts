declare module api {
    interface ITimesheet {
        dates: Date[]
        projectRows: IProjectRow[]    
    }
    
    interface IProjectRow {
        project: IProjectDto
        taskRows: ITaskRow[]
    }
    
    interface IProjectDto {
        id: number
        name: string
    }
        
    interface ITaskRow {
        task: ITaskDto
        entryCells: IEntryCell[]
    }
    
    interface ITaskDto {
        id: number
        name: string
    }
    
    export interface IEntryCell {
        column: number
        time: number
    }
    
    interface IResource {
        _links: ILinks
    }
    
    interface ILinks {
        [rel: string]: ILink
    } 

    interface ILink {
        href: string
    }
    
    interface ITimesheetResource extends ITimesheet, IResource {        
    }
}