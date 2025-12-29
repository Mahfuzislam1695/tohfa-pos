
import Cookies from 'js-cookie';

// export const setToLocalStorage = (key: string, token: string) => {
//   if (!key || typeof window === "undefined") {
//     return ""
//   }
//   return localStorage.setItem(key, token)
// }

// export const getFromLocalStorage = (key: string) => {
//   if (!key || typeof window === "undefined") {
//     return ""
//   }
//   return localStorage.getItem(key)
// }

export const getCookie = (key: string) => {
  return Cookies.get(key) || '';
  // const refreshToken = Cookies.get('refreshToken');
};
// export const setToLocalStorage = (key: string, token: string) => {
//   if (!key || typeof window === "undefined") {
//     return ""
//   }
//   return localStorage.setItem(key, token)
// }

// export const getFromLocalStorage = (key: string) => {
//   if (!key || typeof window === "undefined") {
//     return ""
//   }
//   return localStorage.getItem(key)
// }

