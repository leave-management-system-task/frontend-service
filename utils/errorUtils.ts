import { AxiosError } from "axios";

export interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const response = error.response?.data as ApiErrorResponse | undefined;
    return (
      response?.message ||
      response?.error ||
      error.message ||
      "An error occurred"
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unknown error occurred";
};
