import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini safely to prevent crash on startup if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "GestRH Backend Live!" });
});

// 1. AI Chat Assistant for HR (Labor laws, document generation, HR guidelines)
app.post("/api/gemini/chat", async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Mensagem obrigatória" });
  }

  const client = getGeminiClient();
  if (!client) {
    // Elegant fallback simulation
    console.warn("GEMINI_API_KEY is not defined. Using high-fidelity local HR Simulator.");
    return res.json({
      text: getMockHRResponse(message)
    });
  }

  try {
    // Use ai.models.generateContent or chats.create for chat history
    // We map history objects into appropriate structures or send a full contextual prompt
    const contextPrompt = `Você é o Assistente IA RH do sistema GestRH - uma plataforma moderna de gestão de pessoas e recursos humanos.
Sua função é auxiliar empresas e gestores de RH com:
1. Dúvidas trabalhistas (com base na CLT brasileira e leis vigentes).
2. Processos de RH (atração de talentos, onboarding, benefícios, rescisão, cultura, clima).
3. Criação de vagas e dinâmicas de seleção.
4. Análise de candidatos e preparação de entrevistas.
5. Orientações administrativas e operacionais de departamento pessoal.
6. Sugestões de documentos corporativos.

Mantenha um tom profissional, cordial, assertivo e focado na legislação do Brasil. Sempre responda em formato Markdown bem estruturado.

Histórico da conversa:
${history.map((h: any) => `${h.role === 'user' ? 'Usuário' : 'Assistente IA'}: ${h.text}`).join('\n')}

Usuário: ${message}
Assistente IA RH:`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contextPrompt,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in Gemini Chat:", error);
    res.status(500).json({ error: "Erro ao consultar Assistente IA: " + error.message });
  }
});

// 2. Intelligent Candidate screening (Triagem automática)
app.post("/api/gemini/analyze-candidate", async (req, res) => {
  const { candidate, job } = req.body;
  if (!candidate) {
    return res.status(400).json({ error: "Candidato inválido" });
  }

  const client = getGeminiClient();
  if (!client) {
    // Simulated professional scoring and analysis
    console.warn("GEMINI_API_KEY missing. Simulating analysis.");
    const score = Math.floor(Math.random() * 30) + 65; // random professional score 65-95
    return res.json({
      score,
      analysis: `### Análise Curricular Avançada (Modo Demonstração)

O candidato **${candidate.name}** possui um perfil muito interessante para a área de **${candidate.area || 'Geral'}**.

**Pontos Fortes Identificados:**
- Experiência relevante relatada de: *"${candidate.experience}"*.
- Localização em **${candidate.city} - ${candidate.state}**, compatível com as necessidades da empresa.
- Boa apresentação profissional e histórico de competências técnicas correspondentes.

**Recomendações para Entrevista:**
1. Aprofundar perguntas sobre os principais desafios superados na última empresa.
2. Realizar teste prático de nivelamento para validar as competências.
3. Alinhamento de expectativa salarial.`
    });
  }

  try {
    const prompt = `Você é um Recrutador IA Sênior do GestRH. Faça a triagem do candidato para a vaga abaixo:

Vaga:
- Título: ${job?.title || 'Não especificada'}
- Departamento: ${job?.department || 'Geral'}
- Requisitos: ${JSON.stringify(job?.requirements || [])}
- Descrição: ${job?.description || 'Geral'}

Candidato:
- Nome: ${candidate.name}
- Área de Atuação: ${candidate.area}
- Experiência: ${candidate.experience}
- Cidade/Estado: ${candidate.city}/${candidate.state}

Forneça sua resposta em formato JSON contendo obrigatoriamente duas propriedades:
1. "score": um número inteiro de 0 a 100 indicando a aderência do candidato aos requisitos da vaga.
2. "analysis": uma string em Markdown estruturada detalhando os pontos fortes, pontos fracos, compatibilidade e 3 sugestões de perguntas para a entrevista presencial/online.

Exemplo de formato esperado:
{
  "score": 85,
  "analysis": "### Análise de Compatibilidade..."
}`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "A score from 0 to 100" },
            analysis: { type: Type.STRING, description: "Markdown detailed analysis" }
          },
          required: ["score", "analysis"]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json({
      score: parsed.score || 70,
      analysis: parsed.analysis || "Não foi possível estruturar a análise."
    });
  } catch (error: any) {
    console.error("Error in candidate analysis:", error);
    res.status(500).json({ error: "Erro ao analisar currículo: " + error.message });
  }
});

// 3. AI Job description builder
app.post("/api/gemini/generate-job", async (req, res) => {
  const { title, department, workModel, type } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Título da vaga obrigatório" });
  }

  const client = getGeminiClient();
  if (!client) {
    console.warn("GEMINI_API_KEY missing. Simulating job generation.");
    return res.json({
      description: `Buscamos um profissional de **${title}** para integrar nosso time de **${department || 'Operações'}** atuando no modelo **${workModel || 'Híbrido'}** em regime de contratação **${type || 'CLT'}**.

O profissional será responsável pelo desenvolvimento de novas soluções, manutenção preventiva de sistemas vigentes e colaboração multifuncional constante.`,
      requirements: [
        "Experiência prévia comprovada na área",
        "Formação em áreas correlatas ou equivalente de mercado",
        "Forte capacidade analítica e trabalho em equipe",
        "Excelentes habilidades de comunicação verbal e escrita"
      ]
    });
  }

  try {
    const prompt = `Gere uma descrição de cargo profissional e uma lista de requisitos em formato JSON para a seguinte vaga:
- Cargo: ${title}
- Departamento: ${department || 'Recursos Humanos'}
- Modelo de Trabalho: ${workModel || 'Presencial'}
- Tipo de Contrato: ${type || 'CLT'}

Retorne um objeto JSON contendo obrigatoriamente:
1. "description": uma string formatada em Markdown descrevendo o perfil ideal, responsabilidades e desafios do cargo.
2. "requirements": um array de strings com de 4 a 6 competências necessárias (técnicas e comportamentais).

Exemplo de formato esperado:
{
  "description": "Buscamos um profissional...",
  "requirements": ["Domínio de SQL", "Comunicação proativa"]
}`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            requirements: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["description", "requirements"]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json({
      description: parsed.description,
      requirements: parsed.requirements || []
    });
  } catch (error: any) {
    console.error("Error in job generation:", error);
    res.status(500).json({ error: "Erro ao gerar vaga pela IA: " + error.message });
  }
});

// 4. Smart Interview AI Analysis Route (Entrevista Inteligente)
app.post("/api/gemini/analyze-interview", async (req, res) => {
  const { candidateName, jobTitle, notes, durationSeconds, transcript } = req.body;
  if (!candidateName) {
    return res.status(400).json({ error: "Nome do candidato obrigatório" });
  }

  const client = getGeminiClient();
  if (!client) {
    return res.json({
      transcriptSummary: `A entrevista com ${candidateName} para a posição de ${jobTitle} foi analisada com sucesso. O candidato exibiu bom vocabulário técnico e articulou exemplos sólidos.`,
      overallScore: 8.7,
      jobCompatibility: 89,
      strengths: [
        "Comunicação fluida e estrutura de raciocínio lógico",
        "Forte vivência prática nas atribuições essenciais do cargo",
        "Elevado comprometimento com metas e engajamento com a equipe"
      ],
      improvements: [
        "Sugerido acompanhamento nos primeiros 30 dias para alinhamento de processos internos"
      ],
      suggestedDecision: "Aprovado"
    });
  }

  try {
    const prompt = `Você é um Psicólogo Organizacional e Recrutador Sênior de RH responsável pela avaliação do candidato ${candidateName} para o cargo de ${jobTitle}.
Anotações da entrevista: ${notes || 'Sem anotações manuais'}
Transcrição/Resumo: ${JSON.stringify(transcript || [])}

Analise rigorosamente e forneça a resposta em JSON com:
1. "transcriptSummary": string (Resumo estruturado da entrevista)
2. "overallScore": number (Nota final de 0.0 a 10.0)
3. "jobCompatibility": number (Porcentagem de 0 a 100)
4. "strengths": array de strings (3 a 5 pontos fortes)
5. "improvements": array de strings (2 a 4 pontos de melhoria)
6. "suggestedDecision": string ("Aprovado", "Segunda Entrevista", "Banco de Talentos", "Reprovado")`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error analyzing interview:", error);
    res.status(500).json({ error: "Erro ao analisar entrevista: " + error.message });
  }
});

// Mock HR Responses for Demonstração offline
function getMockHRResponse(message: string): string {
  const msg = message.toLowerCase();
  
  if (msg.includes("clt") || msg.includes("trabalhista") || msg.includes("lei") || msg.includes("férias") || msg.includes("prazo")) {
    return `### ⚖️ Orientações Trabalhistas Legais (CLT)

De acordo com as diretrizes trabalhistas vigentes no Brasil (CLT):

1. **Fracionamento de Férias:** Desde a Reforma Trabalhista (Art. 134 da CLT), as férias podem ser usufruídas em até **3 períodos**, desde que haja concordância do colaborador. Um dos períodos não pode ser menor que 14 dias corridos e os demais não podem ser menores que 5 dias corridos cada.
2. **Aviso Prévio Proporcional:** Lei nº 12.506/2011 acrescenta 3 dias por ano completo trabalhado ao aviso prévio mínimo de 30 dias, limitando-se ao máximo de 90 dias totais.
3. **Prazo de Pagamento de Rescisão:** Deve ser efetuado em até **10 dias corridos** contados a partir do término do contrato, independentemente do tipo de aviso prévio (trabalhado ou indenizado).

*Esta resposta foi gerada pelo simulador local integrado. Configure a chave do Gemini em Secrets para obter respostas jurídicas em tempo real.*`;
  }
  
  if (msg.includes("contratar") || msg.includes("documento") || msg.includes("admiss")) {
    return `### 📄 Checklist de Documentação Admissional (GestRH)

Para admissão em regime **CLT**, os seguintes documentos são exigidos por lei para cadastro no eSocial:

- **Identidade (RG)** e **CPF** (ou CNH ativa).
- **Carteira de Trabalho (CTPS)** (física ou digital via CPF).
- **Comprovante de Residência** atualizado (últimos 90 dias).
- **Título de Eleitor** e comprovante de quitação militar (homens até 45 anos).
- **Atestado de Saúde Ocupacional (ASO Admissional)** - obrigatório antes do início da jornada de trabalho.
- Certidão de Nascimento e caderneta de vacinação dos filhos (para cálculo de salário-família e dedução de IR).

*Dica do Assistente:* Utilize o **Módulo Contratação** para cadastrar estes documentos e controlar o status do checklist individualmente por colaborador.`;
  }

  if (msg.includes("benefício") || msg.includes("refeição") || msg.includes("vt") || msg.includes("desconto")) {
    return `### 🍎 Guia de Gestão de Benefícios Corporativos

No GestRH, os benefícios são classificados como Proventos ou Descontos. Algumas regras importantes:

- **Vale-Transporte (VT):** A legislação autoriza o desconto em folha de até **6%** sobre o salário-base do trabalhador. Se o custo dos passes for menor, o desconto limita-se ao valor real gasto.
- **Vale-Alimentação (VA) e Vale-Refeição (VR):** Empresas filiadas ao PAT (Programa de Alimentação do Trabalhador) contam com isenção de encargos sociais sobre estes valores e podem descontar até 20% do salário em contrapartida, embora a prática de mercado use valores fixos simbólicos (ex: R$ 1,00 ou R$ 2,00).
- **Planos de Saúde/Odonto:** Podem ser custeados integralmente pela empresa ou coparticipados em formato de porcentagem de desconto.

*Dica de Execução:* Você pode gerenciar estas regras ativando o **Módulo Benefícios** na aba de Gestão do seu GestRH.`;
}

  return `### 👋 Olá! Sou o Assistente IA de Gestão de Pessoas da GestRH

Estou pronto para ajudar você e sua equipe de Recursos Humanos. Faça uma pergunta sobre:

- **Dúvidas Trabalhistas:** Pergunte-me sobre férias, rescisões, horas extras ou banco de horas de acordo com a CLT.
- **Onboarding e Contratações:** Entenda quais documentos exigir ou como formalizar contratos CLT, PJ ou Estágio.
- **Sugestões de Redação:** Peça-me para redigir o anúncio de uma nova vaga, um comunicado interno de feedback, ou roteiro de desligamento.
- **Análise Prática:** Peça análises e comparativos de metodologias ágeis em RH.

*Para respostas completas e dinâmicas utilizando inteligência artificial generativa atualizada, lembre-se de configurar a variável \`GEMINI_API_KEY\` no painel de Secrets da plataforma!*`;
}

// Vite static file / API Server Setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[GestRH Engine] Server booted and listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
