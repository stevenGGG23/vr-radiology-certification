import type { NextRequest } from "next/server";
import { handlers } from "@/auth";
import { googleSignInEnabled } from "@/lib/auth-config";

/** Without Google credentials, report "nobody signed in" instead of failing. */
function notConfigured(request: NextRequest) {
  if (request.nextUrl.pathname.endsWith("/session")) return Response.json(null);
  return Response.json({ error: "Google sign-in is not configured." }, { status: 404 });
}

export const GET = googleSignInEnabled ? handlers.GET : notConfigured;
export const POST = googleSignInEnabled ? handlers.POST : notConfigured;
