import { IResistors } from "./resistor";

export interface IResistorsResponse {
    total_count: number,
    len: number,
    offset: number,
    register_list: IResistors[]
}