export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/my-tasks/:path*",
    "/team/:path*",
    "/users/:path*",
    "/settings/:path*",
    "/graph/:path*",
  ],
};
