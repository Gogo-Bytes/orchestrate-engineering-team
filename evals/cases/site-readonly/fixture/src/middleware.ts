export function middleware(request: { pathname: string }) {
  if (request.pathname === "/old") return { status: 301, location: "/new" };
  return { status: 200 };
}
