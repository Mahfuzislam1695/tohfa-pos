"use server";

import { cookies } from "next/headers";

export async function refreshCreate(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("refreshToken", token);
}
export async function accessTokenCreate(token: string) {
  console.log("accessTokenCreate", token);
  const cookieStore = await cookies();
  cookieStore.set("accessToken", token);
}

export async function refreshDelete() {
  (await cookies()).delete("refreshToken");
}
export async function accessTokenDelete() {
  (await cookies()).delete("accessToken");
}

// === GET ===
export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("refreshToken")?.value;
}

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value;
}