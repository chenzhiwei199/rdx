import { ICube } from "./aggregateCore";
export interface Order {
    code: string;
    type: OrderType;
}
export declare enum OrderType {
    Asc = "asc",
    Desc = "desc"
}
export interface IQueryConfig extends ICube {
    filters?: Filters;
    orders?: Order[];
}
export declare type Filters = (Filter[] | Filter)[];
export interface Filter {
    member: string;
    operator: Operator;
    values: any;
}
export declare enum Operator {
    equals = "equals",
    notEquals = "notEquals",
    contains = "contains",
    notContains = "notContains",
    gt = "gt",
    gte = "gte",
    lt = "lt",
    lte = "lte",
    inDateRange = "inDateRange",
    notInDateRange = "notInDateRange",
    beforeDate = "beforeDate",
    afterDate = "afterDate"
}
