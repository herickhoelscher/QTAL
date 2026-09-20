import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "portal_session";

/**
 * Primeira barreira das rotas do painel: sem cookie de sessao valido, o acesso
 * a /admin/* volta para o login. A verificacao definitiva continua no layout
 * do painel e em cada server action — esta camada so evita o flash de tela.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin é a própria tela de login.
  if (pathname === "/admin") return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token && process.env.AUTH_SECRET) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
      return NextResponse.next();
    } catch {
      // token expirado ou adulterado: cai no redirecionamento abaixo
    }
  }

  const loginUrl = new URL("/admin", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
