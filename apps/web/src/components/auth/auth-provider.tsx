"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { savePendingMeetingUrl } from "@/lib/pending-meeting";
import { Loader2 } from "lucide-react";

// Routes that don't require authentication
const publicRoutes = ["/login", "/auth/verify", "/auth/zoom/callback"];

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, checkAuth, didLogout } = useAuthStore();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectBlocked, setRedirectBlocked] = useState(false);
  const meetingUrlCaptured = useRef(false);
  const authRedirectKey = "grainbox-auth-redirect-attempted";

  // Capture meetingUrl from query string and save to localStorage before any redirect
  useEffect(() => {
    if (meetingUrlCaptured.current) return;
    meetingUrlCaptured.current = true;

    const params = new URLSearchParams(window.location.search);
    const meetingUrl = params.get("meetingUrl");
    if (meetingUrl) {
      savePendingMeetingUrl(meetingUrl);
    }
  }, []);

  // Check if current route is public
  const isPublicRoute = publicRoutes.some((route) => pathname?.startsWith(route));

  // Only verify session on protected routes to avoid 401 in console on /login, /auth/zoom/callback
  useEffect(() => {
    if (pathname == null) {
      checkAuth(); // path not yet known
    } else if (!publicRoutes.some((route) => pathname.startsWith(route))) {
      checkAuth(); // protected route
    }
  }, [pathname, checkAuth]);

  // Handle redirect in useEffect to avoid React render warning
  useEffect(() => {
    if (isAuthenticated) {
      sessionStorage.removeItem(authRedirectKey);
      setRedirectBlocked(false);
      setShouldRedirect(false);
      return;
    }

    if (!isLoading && !isAuthenticated && !isPublicRoute) {
      if (sessionStorage.getItem(authRedirectKey) === window.location.pathname) {
        // Authentik returned to Grainbox without an authenticated proxy
        // session. Stop here instead of starting Grainbox -> Authentik again.
        setRedirectBlocked(true);
        return;
      }
      sessionStorage.setItem(authRedirectKey, window.location.pathname);
      setShouldRedirect(true);
    }
  }, [isLoading, isAuthenticated, isPublicRoute]);

  const beginAuth = () => {
    sessionStorage.removeItem(authRedirectKey);
    const returnUrl = encodeURIComponent(window.location.href);
    const externalAuthUrl = process.env.NEXT_PUBLIC_EXTERNAL_AUTH_URL;
    if (externalAuthUrl) {
      window.location.replace(`${externalAuthUrl}?returnUrl=${returnUrl}`);
      return;
    }
    window.location.replace(
      `${window.location.origin}/outpost.goauthentik.io/start?rd=${returnUrl}`,
    );
  };

  useEffect(() => {
    if (shouldRedirect) {
      const externalAuthUrl = process.env.NEXT_PUBLIC_EXTERNAL_AUTH_URL;
      if (externalAuthUrl) {
        // SSO: redirect to webapp for authentication
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.replace(`${externalAuthUrl}?returnUrl=${returnUrl}`);
      } else {
        // Grainbox is SSO-only. Re-enter through the Authentik outpost so an
        // expired session cannot leave the app stuck on the loading spinner.
        // In development, skip authentik and redirect to /login instead.
        if (process.env.NEXT_PUBLIC_DEV_BYPASS_AUTHENTIK === "true") {
          window.location.replace("/login");
        } else {
          beginAuth();
        }
      }
    }
  }, [shouldRedirect, router, didLogout]);

  // If on a public route, just render children
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // If loading or need to redirect, show loading state
  if (redirectBlocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-muted-foreground">
          Authentik no confirmó la sesión para Grainbox.
        </p>
        <button
          type="button"
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
          onClick={beginAuth}
        >
          Reintentar inicio de sesión
        </button>
      </div>
    );
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
}
