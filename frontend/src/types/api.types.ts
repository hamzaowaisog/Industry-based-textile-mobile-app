export type ApiResponse<T = void> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
};
