export interface IUserInformation {
    id: string;
    name: string;
    email: string;
    role: string;
    routes: string[];
    permissions: string[];
}

export interface IDataItem {
    id: number;
    name: string;
}

export interface IInitialState {
    userInformation: IUserInformation;
    data: unknown[];
    // data: IDataItem[]; // Array of IDataItem objects
}