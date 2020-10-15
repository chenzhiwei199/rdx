export interface ICube {
    factTable?: any[];
    dimensions: string[];
    measures: {
        key: string;
        aggregateType: AggregateType;
    }[];
}
export declare enum AggregateType {
    Count = "count",
    Min = "min",
    Max = "max",
    Sum = "sum",
    Avg = "avg"
}
export interface Node {
    [key: string]: any;
    _rawData: any[];
}
export declare function aggregateData(config: ICube): any[];
