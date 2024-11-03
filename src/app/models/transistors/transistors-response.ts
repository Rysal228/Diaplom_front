import { ITransistors } from "./transistors";

export interface ITransistorsResponse {
    total_count: number,
    len: number,
    offset: number,
    transistor_list: ITransistors[]
}