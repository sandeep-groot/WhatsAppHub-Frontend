import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuth?: boolean;
    skipAuthRefresh?: boolean;
    _retry?: boolean;
  }

  export interface InternalAxiosRequestConfig {
    skipAuth?: boolean;
    skipAuthRefresh?: boolean;
    _retry?: boolean;
  }
}
