import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // O Proxy busca o cookie que definimos no LoginPage
  const token = request.cookies.get('user_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Se o usuário NÃO está logado e tenta acessar páginas internas
  // (Protege a raiz e qualquer sub-página que não seja o login)
  if (!token && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Se o usuário JÁ ESTÁ logado e tenta ir para a página de login
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Esta linha é o "pulo do gato" para a nova convenção do Next.js 16
export const proxy = middleware;

export const config = {
  // Define quais rotas o proxy deve monitorar
  // Ignora arquivos estáticos (imagens, logos, etc) para não quebrar o layout
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo-sbacem.png).*)'],
};