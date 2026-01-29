// app/api/processar-retorno/route.ts
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;
  
  const texto = await file.text();
  const linhas = texto.split('\n');

  for (const linha of linhas) {
    // Exemplo: ISRC está na posição 0-12, Código de Erro na 13-15
    const isrc = linha.substring(0, 12).trim();
    const erro = linha.substring(13, 15).trim();

    if (isrc) {
      await prisma.fonograma.update({
        where: { isrc: isrc },
        data: {
          status: erro === "00" ? "CONCLUIDO" : "ERRO",
          mensagemErro: erro !== "00" ? `Erro código: ${erro}` : null
        }
      });
    }
  }

  return Response.json({ success: true });
}