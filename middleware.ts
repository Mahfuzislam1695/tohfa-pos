import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
    exp: number;
    email: string;
    roles: string;
}

// Define route constants
const PUBLIC_ROUTES = ["/", "/login"];
const AUTH_ROUTES = ["/login"];
const ERROR_ROUTES = ["/error", "/network-error", "/unauthorized"];

// Define role hierarchy
const ROLES = {
    OWNER: "Owner",
    ADMIN: "Admin",
    MANAGER: "Manager",
    STAFF: "Staff"
};

// Define role-based route permissions
const ROLE_PERMISSIONS = {
    [ROLES.OWNER]: ["*"], // Access to all routes
    [ROLES.ADMIN]: ["*"], // Access to all routes
    [ROLES.MANAGER]: ["*"], // Access to all routes
    [ROLES.STAFF]: ["/pos", "/profile"] // Staff can only access POS
};

// Define default redirect routes for each role after login
const DEFAULT_REDIRECT_ROUTES = {
    [ROLES.OWNER]: "/dashboard",
    [ROLES.ADMIN]: "/dashboard",
    [ROLES.MANAGER]: "/dashboard",
    [ROLES.STAFF]: "/pos"
};

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const accessToken = req.cookies.get("accessToken")?.value;
    const refreshToken = req.cookies.get("refreshToken")?.value;

    let isLoggedIn = false;
    let userRole: string | null = null;
    let isTokenExpired = false;

    // Check if current path is a public route
    const isPublicRoute = PUBLIC_ROUTES.some(route =>
        route === pathname || pathname.startsWith(route + '/')
    );

    // Check if current path is an auth route
    const isAuthRoute = AUTH_ROUTES.some(route =>
        route === pathname || pathname.startsWith(route + '/')
    );

    // Check if current path is an error route
    const isErrorRoute = ERROR_ROUTES.some(route =>
        route === pathname || pathname.startsWith(route + '/')
    );

    // Decode token if exists
    if (accessToken) {
        try {
            const user = jwtDecode<DecodedToken>(accessToken);
            if (user.exp * 1000 > Date.now()) {
                isLoggedIn = true;
                userRole = user.roles;
            } else {
                // Access token is expired, but we have a refresh token
                isTokenExpired = true;
                isLoggedIn = true; // Still consider logged in if refresh token exists
                userRole = user.roles; // Keep the role for redirect logic
            }
        } catch {
            isLoggedIn = false;
            userRole = null;
        }
    }

    // Handle public routes (always accessible)
    if (isPublicRoute || isErrorRoute) {
        return NextResponse.next();
    }

    // Handle authentication
    if (!isLoggedIn) {
        // Redirect to login if not authenticated
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Handle token expiration
    if (isTokenExpired && refreshToken) {
        // You might want to implement token refresh logic here
        // For now, we'll redirect to a refresh endpoint or show a message
        const refreshUrl = new URL("/api/auth/refresh", req.url);
        refreshUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(refreshUrl);
    }

    // Handle auth routes when already logged in
    if (isAuthRoute && isLoggedIn && userRole) {
        // Redirect to role-specific default page if trying to access login while logged in
        const defaultRedirect = DEFAULT_REDIRECT_ROUTES[userRole as keyof typeof DEFAULT_REDIRECT_ROUTES] || "/dashboard";
        return NextResponse.redirect(new URL(defaultRedirect, req.url));
    }

    // Check role-based permissions
    if (userRole) {
        // Get allowed routes for the user's role
        const allowedRoutes = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];

        // If no permission configuration exists for this role, deny access
        if (!allowedRoutes) {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
        }

        // Check if user has access to all routes or specific route
        const hasAccess = allowedRoutes.includes("*") ||
            allowedRoutes.some(route =>
                route === pathname ||
                pathname.startsWith(route + '/')
            );

        // Special handling for Staff role - can only access /pos route
        if (userRole === ROLES.STAFF && !pathname.startsWith("/pos")) {
            return NextResponse.redirect(new URL("/pos", req.url));
        }

        if (!hasAccess) {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};