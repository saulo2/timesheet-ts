declare module api {
    interface ITimesheet {
        dates: Date[]
        projectRows: IProjectRow[]    
    }
    
    interface IProjectRow {
        id: number
        projectName: string
        taskRows: ITaskRow[]
    }
            
    interface ITaskRow {
        id: number
        taskName: string
        entryCells: IEntryCell[]
    }
    
    interface IEntryCell {
        id: number
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