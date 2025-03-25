export type ErrorResponse = {
  errors: string[];
};

export type SuccessResponse<T> = {
  data: T;
};
