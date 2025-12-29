export interface User {
  id: string;
  name: string;
  email: string;
  image: string;
}

export interface Session {
  user: User;
}

export interface IMeta {
  // limit: number;
  // page: number;
  // total: number;

  totalItems?: number;
  itemCount?: number;
  itemsPerPage?: number;
  totalPages?: number;
  currentPage?: number;
}

export type IGenericErrorResponse = {
  statusCode: number;
  message: string;
  errorMessages: IGenericErrorMessage[] | string | unknown;
};

export type IGenericErrorMessage = {
  path: string | number;
  message: string;
};

export type ResponseSuccessType = {
  data: unknown;
  meta?: IMeta;
  statusCode: number;
  success: boolean;
  message: string;
};
