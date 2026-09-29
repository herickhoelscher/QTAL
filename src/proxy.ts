import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "portal_session";

/**
 * Duas responsabilidades:
 *
 * 1. Idioma. As paginas publicas vivem em app/[lang]. Ingles e espanhol chegam
 *    com prefixo (/en, /es); o portugues nao tem prefixo visivel e e reescrito
 *    internamente para /pt. Quem digitar /pt/... e redirecionado para o
 *    endereco sem prefixo, para nao existirem dois enderecos da mesma pagina.
 *
 * 2. Painel. Sem cookie de sessao valido, /admin/* volta para o login. A
 *    verificacao definitiva continua no layout do painel e em cada server
 *    action — esta camada so evita o flash de tela.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) return guardAdmin(request);

  if (/^\/(en|es)(\/|$)/.test(pathname)) return NextResponse.next();

  if (/^\/pt(\/|$)/.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  const url = request.nextUrl.clone();
  url.pathname = "/pt" + (pathname === "/" ? "" : pathname);
  return NextResponse.rewrite(url);
}

async function guardAdmin(request: NextRequest) {
  // /admin é a própria tela de login.
  if (request.nextUrl.pathname === "/admin") return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token && process.env.AUTH_SECRET) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
      return NextResponse.next();
    } catch {
      // token expirado ou adulterado: cai no redirecionamento abaixo
    }
  }

  return NextResponse.redirect(new URL("/admin", request.url));
}

export const config = {
  // Tudo, menos internos do Next, rotas de API e arquivos com extensao
  // (imagens do /public, favicon.ico, robots.txt, sitemap.xml).
  matcher: ["/((?!_next|api|.*\\.[^/]+$).*)"],
};
