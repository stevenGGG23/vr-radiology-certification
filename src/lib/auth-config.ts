/**
 * True when Google sign-in credentials are configured. Read on the server
 * (these variables are never sent to the browser) and passed down as a prop.
 * Adding the variables in Vercel requires a redeploy to take effect.
 */
export const googleSignInEnabled = Boolean(
  process.env.AUTH_SECRET && process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);
