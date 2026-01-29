// Localização: /src/app/api/retorno-ecad/route.ts

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const texto = await file.text();

  // O arquivo do ECAD geralmente é posicional ou CSV
  const linhas = texto.split("\n");

  for (const linha of linhas) {
    const isrc = linha.substring(0, 12).trim(); // Exemplo de leitura posicional
    const erro = linha.substring(50, 80).trim();

    // Requisito 4: Atualiza o status no Banco de Dados
    await prisma.fonograma.update({
      where: { isrc: isrc },
      data: {
        status: erro ? "ERRO" : "CONCLUIDO",
        mensagemErro: erro || null
      }
    });
  }

  return Response.json({ message: "Status atualizados com sucesso!" });
}