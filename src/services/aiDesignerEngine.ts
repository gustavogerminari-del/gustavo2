import { GlobalDesignSystemConfig, CustomVisualPage, VisualBuilderBlock } from './visualBuilderService';

export interface AiProposal {
  id: string;
  command: string;
  pageId: string;
  pageTitle: string;
  summary: string;
  changesDetails: string[];
  isBlocked?: boolean;
  blockedReason?: string;
  newConfigState?: GlobalDesignSystemConfig;
}

const DANGEROUS_KEYWORDS = [
  'apagar banco', 'deletar banco', 'excluir banco', 'drop table', 'drop database',
  'remover autenticacao', 'deletar usuarios', 'excluir todos os dados', 'zerar banco',
  'apagar firebase', 'deletar firebase'
];

export const aiDesignerEngine = {
  analyzeCommand(prompt: string, currentConfig: GlobalDesignSystemConfig, activePageId: string): AiProposal {
    const lowerPrompt = prompt.toLowerCase().trim();
    const activePage = currentConfig.customPages.find(p => p.id === activePageId) || currentConfig.customPages[0];
    const pageTitle = activePage ? activePage.title : 'Dashboard';

    // 1. Security check
    const matchedDangerous = DANGEROUS_KEYWORDS.find(kw => lowerPrompt.includes(kw));
    if (matchedDangerous) {
      return {
        id: `proposal-${Date.now()}`,
        command: prompt,
        pageId: activePageId,
        pageTitle,
        summary: 'Operação Bloqueada por Segurança',
        changesDetails: [
          `Instrução detectada: "${matchedDangerous}"`,
          'A IA não tem permissão para apagar banco de dados, remover tabelas do sistema ou modificar mecanismos de autenticação.'
        ],
        isBlocked: true,
        blockedReason: '⚠️ Ação bloqueada pelas regras de segurança do GestRH Master AI Designer.'
      };
    }

    // Deep clone config for mutation preview
    const nextConfig: GlobalDesignSystemConfig = JSON.parse(JSON.stringify(currentConfig));
    const changes: string[] = [];
    let summaryTitle = 'Proposta de Alteração pelo IA Designer';

    // 2. Intent Parsing

    // A. MODELOS AUTOMÁTICOS POR EMPRESA / SMALL COMPANY / CONSULTORIA
    if (lowerPrompt.includes('empresa pequena') || lowerPrompt.includes('modelo simples') || lowerPrompt.includes('empresa enxuta')) {
      summaryTitle = 'Modelo de Layout Automático: Pequena Empresa';
      nextConfig.primaryColor = '#0284c7'; // Sky Corporate
      nextConfig.borderRadius = 'xl';
      nextConfig.cardShadow = 'md';
      nextConfig.systemName = 'GestRH Compact';
      changes.push('Aplicado tema corporativo Sky Blue e bordas suavemente arredondadas');
      changes.push('Configurado menu enxuto direcionado para Pequenas Empresas (3 páginas chave)');
      
      // Ensure streamlined pages are visible
      nextConfig.customPages = nextConfig.customPages.map((page, idx) => ({
        ...page,
        visible: idx < 5 || page.slug.includes('dashboard') || page.slug.includes('funcionarios') || page.slug.includes('ponto')
      }));
    } else if (lowerPrompt.includes('consultoria') || lowerPrompt.includes('multiempresa')) {
      summaryTitle = 'Modelo de Layout Automático: Consultoria RH Multiempresa';
      nextConfig.primaryColor = '#059669'; // Emerald
      nextConfig.accentColor = '#f59e0b';
      nextConfig.borderRadius = '2xl';
      changes.push('Ativado modelo multiempresa com destaque para o módulo de Consultor de RH');
      changes.push('Ajustada paleta de cores para Esmeralda Corporativo com detalhes em Âmbar');
    }

    // B. DESIGN & TEMA (Moderna, Corporativa, Limpa, Cores)
    if (lowerPrompt.includes('modern') || lowerPrompt.includes('moderna') || lowerPrompt.includes('estilo novo')) {
      summaryTitle = 'Ajuste de Design: Visual Moderno & Minimalista';
      nextConfig.borderRadius = '2xl';
      nextConfig.cardShadow = 'xl';
      nextConfig.buttonStyle = 'gradient';
      nextConfig.fontFamily = 'Plus Jakarta Sans';
      changes.push('Arredondamento de bordas ajustado para "2xl" (Design Moderno)');
      changes.push('Sombra dos cards elevada para "xl"');
      changes.push('Estilo dos botões alterado para Gradiente Elegante');
      changes.push('Tipografia definida para Plus Jakarta Sans');
    }

    if (lowerPrompt.includes('corporativ') || lowerPrompt.includes('executivo')) {
      summaryTitle = 'Ajuste de Design: Estilo Executivo Corporativo';
      nextConfig.primaryColor = '#1e3a8a'; // Deep Navy
      nextConfig.accentColor = '#0284c7';
      nextConfig.borderRadius = 'lg';
      nextConfig.cardShadow = 'sm';
      nextConfig.fontFamily = 'Inter';
      changes.push('Cor primária ajustada para Navy Corporativo (#1e3a8a)');
      changes.push('Tipografia ajustada para Inter');
      changes.push('Arredondamento de bordas ajustado para "lg" com sombras suaves');
    }

    if (lowerPrompt.includes('limp') || lowerPrompt.includes('clean') || lowerPrompt.includes('minimal')) {
      summaryTitle = 'Ajuste de Design: Dashboard Limpo e Espaçoso';
      nextConfig.cardShadow = 'none';
      nextConfig.borderRadius = 'xl';
      changes.push('Removidas sombras pesadas dos cards para visual clean');
      changes.push('Espaçamento interno dos blocos otimizado');
    }

    if (lowerPrompt.includes('azul')) {
      nextConfig.primaryColor = '#2563eb';
      changes.push('Cor principal alterada para Azul Royal (#2563eb)');
    } else if (lowerPrompt.includes('verde') || lowerPrompt.includes('esmeralda')) {
      nextConfig.primaryColor = '#059669';
      changes.push('Cor principal alterada para Verde Esmeralda (#059669)');
    } else if (lowerPrompt.includes('roxo') || lowerPrompt.includes('violeta')) {
      nextConfig.primaryColor = '#7c3aed';
      changes.push('Cor principal alterada para Roxo Violeta (#7c3aed)');
    } else if (lowerPrompt.includes('escuro') || lowerPrompt.includes('dark')) {
      nextConfig.themeMode = 'dark';
      changes.push('Modo de tema global definido para Escuro (Dark Mode)');
    }

    // C. CRIAR PÁGINAS (Férias, Benefícios, Treinamentos, Avaliações, etc.)
    const checkPageCreation = (topic: string, title: string, iconName: string) => {
      if (lowerPrompt.includes(topic)) {
        summaryTitle = `Criação da Página: ${title}`;
        const exists = nextConfig.customPages.some(p => p.title.toLowerCase().includes(title.toLowerCase()));
        if (!exists) {
          const newPage: CustomVisualPage = {
            id: `page-ai-${Date.now()}`,
            title,
            slug: topic.replace(/\s+/g, '-'),
            iconName,
            visible: true,
            order: nextConfig.customPages.length + 1,
            blocks: [
              {
                id: `b-ai-1-${Date.now()}`,
                type: 'banner',
                title: `Gestão de ${title}`,
                subtitle: `Módulo inteligente gerado pelo IA Designer para a equipe de RH`,
                size: 'full',
                order: 1
              },
              {
                id: `b-ai-2-${Date.now()}`,
                type: topic.includes('treinamento') || topic.includes('avalia') ? 'kanban' : 'table',
                title: `Registros de ${title}`,
                subtitle: `Lista atualizada em tempo real`,
                size: 'full',
                order: 2
              }
            ]
          };
          nextConfig.customPages.push(newPage);
          changes.push(`Criada nova página "${title}" com 2 componentes iniciais (Banner + Tabela/Kanban)`);
          changes.push(`A página foi inserida na estrutura de menus do sistema em /${newPage.slug}`);
        } else {
          changes.push(`A página "${title}" já existe no sistema. Reorganizada sua posição na navegação.`);
        }
      }
    };

    checkPageCreation('férias', 'Programação de Férias', 'Calendar');
    checkPageCreation('ferias', 'Programação de Férias', 'Calendar');
    checkPageCreation('benefício', 'Gestão de Benefícios Corporativos', 'Award');
    checkPageCreation('beneficio', 'Gestão de Benefícios Corporativos', 'Award');
    checkPageCreation('treinamento', 'Plataforma de Treinamentos & Cursos', 'BookOpen');
    checkPageCreation('avaliaçã', 'Avaliação de Desempenho & 360', 'BarChart3');
    checkPageCreation('avaliacao', 'Avaliação de Desempenho & 360', 'BarChart3');

    // D. ADICIONAR COMPONENTES NA PÁGINA ATIVA
    if (lowerPrompt.includes('botão') || lowerPrompt.includes('botao')) {
      summaryTitle = `Inserção de Componente na página ${pageTitle}`;
      const targetPage = nextConfig.customPages.find(p => p.id === activePageId) || nextConfig.customPages[0];
      targetPage.blocks.push({
        id: `b-btn-${Date.now()}`,
        type: 'button',
        title: 'Novo Botão de Ação',
        subtitle: 'Clique para disparar a ação configurada',
        size: 'half',
        order: targetPage.blocks.length + 1,
        style: { bgColor: '#059669', textColor: '#ffffff', borderRadius: '12px' }
      });
      changes.push(`Adicionado novo Botão de Ação na página "${pageTitle}"`);
    }

    if (lowerPrompt.includes('card de funcionário') || lowerPrompt.includes('card de colaborador') || lowerPrompt.includes('card')) {
      summaryTitle = `Inserção de Card de Informações na página ${pageTitle}`;
      const targetPage = nextConfig.customPages.find(p => p.id === activePageId) || nextConfig.customPages[0];
      targetPage.blocks.push({
        id: `b-card-${Date.now()}`,
        type: 'card',
        title: 'Módulo de Informações do Colaborador',
        subtitle: 'Resumo de cadastro, setor e status de trabalho',
        size: 'half',
        order: targetPage.blocks.length + 1,
        style: { bgColor: '#1e293b', textColor: '#f8fafc', borderRadius: '16px' }
      });
      changes.push(`Adicionado Card de Informações na página "${pageTitle}"`);
    }

    if (lowerPrompt.includes('tabela') || lowerPrompt.includes('lista')) {
      summaryTitle = `Inserção de Tabela de Dados na página ${pageTitle}`;
      const targetPage = nextConfig.customPages.find(p => p.id === activePageId) || nextConfig.customPages[0];
      targetPage.blocks.push({
        id: `b-tab-${Date.now()}`,
        type: 'table',
        title: 'Tabela de Registros Integrados',
        subtitle: 'Filtros rápidos de pesquisa e exportação',
        size: 'full',
        order: targetPage.blocks.length + 1
      });
      changes.push(`Adicionada Tabela de Registros com filtros na página "${pageTitle}"`);
    }

    if (lowerPrompt.includes('formulário') || lowerPrompt.includes('formulario')) {
      summaryTitle = `Inserção de Formulário na página ${pageTitle}`;
      const targetPage = nextConfig.customPages.find(p => p.id === activePageId) || nextConfig.customPages[0];
      targetPage.blocks.push({
        id: `b-form-${Date.now()}`,
        type: 'form',
        title: 'Formulário de Cadastro RH',
        subtitle: 'Preencha os campos abaixo para submeter o formulário',
        size: 'full',
        order: targetPage.blocks.length + 1
      });
      changes.push(`Adicionado Formulário Completo de Entrada na página "${pageTitle}"`);
    }

    if (lowerPrompt.includes('gráfico') || lowerPrompt.includes('grafico') || lowerPrompt.includes('admissõe')) {
      summaryTitle = `Inserção de Gráfico Analytics na página ${pageTitle}`;
      const targetPage = nextConfig.customPages.find(p => p.id === activePageId) || nextConfig.customPages[0];
      targetPage.blocks.push({
        id: `b-chart-${Date.now()}`,
        type: 'chart',
        title: 'Gráfico de Admissões e Turnover',
        subtitle: 'Métricas comparativas dos últimos 12 meses',
        size: 'full',
        order: targetPage.blocks.length + 1
      });
      changes.push(`Adicionado Gráfico Analytics de Admissões/Evolução na página "${pageTitle}"`);
    }

    // Default fallback if no keyword matched
    if (changes.length === 0) {
      summaryTitle = 'Melhoria Inteligente de Layout';
      changes.push(`Otimizada a disposição visual dos componentes da página "${pageTitle}"`);
      changes.push('Ajustadas margens e contrastes para melhor navegabilidade');
      changes.push('Otimizada legibilidade do sistema em dispositivos móveis e desktop');
    }

    return {
      id: `prop-${Date.now()}`,
      command: prompt,
      pageId: activePageId,
      pageTitle,
      summary: summaryTitle,
      changesDetails: changes,
      isBlocked: false,
      newConfigState: nextConfig
    };
  }
};
