"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type CurrentUser = {
  _id: string;
  name: string;
  email: string;
  role: "participant" | "judge" | "admin";
  isApproved?: boolean;
  judgeStatus?: "active" | "pending" | "blocked";
};

type AuthMeResponse = {
  success: boolean;
  user: CurrentUser;
  message?: string;
};

type PublicAuthState = {
  status: "loading" | "guest" | "authenticated";
  user: CurrentUser | null;
};

function getWorkspaceHref(user: CurrentUser | null) {
  if (!user) return "/";

  if (user.role === "participant") {
    return user.isApproved === false
      ? "/participant/approval-pending"
      : "/participant/dashboard";
  }

  if (user.role === "judge") {
    return "/judge/dashboard";
  }

  if (user.role === "admin") {
    return "/admin/dashboard";
  }

  return "/";
}

function getWorkspaceLabel(user: CurrentUser | null) {
  if (!user) return "Open Workspace";

  if (user.role === "participant") {
    return user.isApproved === false
      ? "View Approval Status"
      : "Open Participant Workspace";
  }

  if (user.role === "judge") {
    return "Open Judge Workspace";
  }

  if (user.role === "admin") {
    return "Open Admin Workspace";
  }

  return "Open Workspace";
}

export function usePublicAuthState() {
  const [state, setState] = useState<PublicAuthState>({
    status: "loading",
    user: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        if (response.status === 401) {
          if (isMounted) {
            setState({
              status: "guest",
              user: null,
            });
          }
          return;
        }

        const data: AuthMeResponse = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load auth state");
        }

        if (isMounted) {
          setState({
            status: "authenticated",
            user: data.user,
          });
        }
      } catch {
        if (isMounted) {
          setState({
            status: "guest",
            user: null,
          });
        }
      }
    }

    void loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const workspaceHref = useMemo(() => getWorkspaceHref(state.user), [state.user]);
  const workspaceLabel = useMemo(
    () => getWorkspaceLabel(state.user),
    [state.user]
  );

  return {
    ...state,
    workspaceHref,
    workspaceLabel,
  };
}

type GuestOnlyProps = {
  children: React.ReactNode;
};

export function GuestOnly({ children }: GuestOnlyProps) {
  const { status } = usePublicAuthState();

  if (status !== "guest") {
    return null;
  }

  return <>{children}</>;
}

type WorkspaceLinkProps = {
  className: string;
  label?: string;
};

export function WorkspaceLink({
  className,
  label,
}: WorkspaceLinkProps) {
  const { status, workspaceHref, workspaceLabel } = usePublicAuthState();

  if (status !== "authenticated") {
    return null;
  }

  return (
    <Link href={workspaceHref} className={className}>
      {label || workspaceLabel}
    </Link>
  );
}
