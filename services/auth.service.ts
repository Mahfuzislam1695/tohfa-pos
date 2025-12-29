import { accessTokenDelete, refreshDelete } from "@/actions/cookiesAction";
import { getBaseUrl } from "@/config/envConfig";
import { authKey } from "@/constants/auth/storageKey";
import { axiosInstance } from "@/helpers/axios/axiosInstance";
import { UserInfoByIdProps } from "@/types/dashboard/dashboard.types";
import Cookies from 'js-cookie';
import { decodedToken } from "./jwt";
import { getCookie } from "@/utils/local-storage";
import { useGet } from "@/hooks/useGet";


export const getUserInfo = () => {
  const authToken = getCookie(authKey);
  // console.log(authToken);
  if (authToken) {
    const decodedData = decodedToken(authToken);
    return decodedData;
  } else {
    return "";
  }
};

// ========== user full data ======

export const UserFullData = (userID: string | undefined) => {
  const { data: userInfoByid } = useGet<UserInfoByIdProps>(`/users/${userID}`, [
    "getUserInfoById",
  ]);
  return userInfoByid;
};

export const isLoggedIn = () => {
  const authToken = getCookie(authKey);
  return !!authToken;
};

export const removeUserInfo = (key: string) => {
  return localStorage.removeItem(key);
};

// export async function logout() {
//   // Delete the refresh token from cookies
//   await refreshDelete();
//   await accessTokenDelete();

//   // Remove user-specific information from localStorage
//   removeUserInfo("accessToken"); // Replace "userInfo" with the actual key you use
//   await refreshDelete();

//   // Redirect to the home page
//   window.location.href = '/login';
//   redirect("/login");
// }

export async function logout() {
  try {
    document.cookie = 'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    await refreshDelete();
    await accessTokenDelete();
    localStorage.removeItem(authKey);
    window.location.href = '/'; // Force full page reload
  } catch (error) {
    console.error('Logout failed:', error);
    window.location.href = '/'; // Ensure redirect even if deletion fails
  }
}

export const getNewAccessToken = async () => {
  const refreshToken = Cookies.get('refreshToken'); // Get from client-side cookies

  console.log("refreshToken", refreshToken);

  return axiosInstance({
    url: `${getBaseUrl()}/auth/refresh`,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
    data: { refreshToken }, // Send refresh token in body
  });
};
