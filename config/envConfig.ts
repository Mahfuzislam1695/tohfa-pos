export const getBaseUrl = (): string => {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    // "http://localhost:5002/tohfa/api/v1"
    "https://tohfa-pos-backend.vercel.app/tohfa/api/v1"
    // "https://bid-bolt-backend.vercel.app/bidbolt/api/v1"
  );
};

export const mainUrl = "https://tohfa-pos-backend.vercel.app/tohfa/api/v1";
// export const mainUrl = "http://localhost:5002/tohfa/api/v1";
// export const mainUrl = "https://bid-bolt-backend.vercel.app/bidbolt/api/v1";

// https://tohfa-pos-backend.vercel.app/
//