import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

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
