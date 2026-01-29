import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Aqui você checa se o token existe (exemplo simples com cookie/localStorage adaptado)
  // Nota: Middleware do Next lida melhor com Cookies.
  const token = request.cookies.get('user_token')?.value;

  // Se tentar acessar o dashboard sem token, vai pro login
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'], // Protege todas as sub-rotas de dashboard
};