import { NextResponse } from "next/server"

/** Legacy `/home-v2` URLs → new shell; preserves query (e.g. `?f=`). */
export function proxy(request: Request) {
  const url = new URL(request.url)
  const { pathname, search } = url
  if (pathname === "/home-v2" || pathname === "/home-v2/") {
    const dest = new URL("/", request.url)
    dest.search = search
    return NextResponse.redirect(dest)
  }
  if (pathname === "/home-v2/explore" || pathname.startsWith("/home-v2/explore/")) {
    const dest = new URL("/explore", request.url)
    dest.search = search
    return NextResponse.redirect(dest)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/home-v2", "/home-v2/:path*"],
}
