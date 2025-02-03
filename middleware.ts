import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Definição do cookie para permitir terceiros
  res.headers.set(
    "Set-Cookie",
    "mp_session=value; Path=/; Secure; HttpOnly; SameSite=None"
  );

  return res;
}
