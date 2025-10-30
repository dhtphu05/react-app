export type User = {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
};

export type LoginResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

export type MeResponse = User;

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFail = {
  success: false;
  error: { message: string };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFail;
