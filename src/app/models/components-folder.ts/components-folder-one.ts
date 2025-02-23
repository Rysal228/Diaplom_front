export interface IComponentsFolderOne{
    name?: string
}

export interface IComponentsFolderOneResponse{
    total_count?: number,
    len?: number,
    offset?: number,
    component_list?: IComponentsFolderOne[]
}

export interface IComponentsFolderOneRequest{
    limit?: number,
    offset?: number,
    name_filter?: string
}

export interface IComponentsFolderThreeRequest{
    pcb_name_filter?: string,
    sch_name_filter?: string
}

export interface IComponentFolderThreeResponse {
    PCB: string[];
    SCH: string[];
}