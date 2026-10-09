export type Experience = { role: string; company: string; period: string; bullets: string[] };
export type Profile = {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
  experiences: Experience[];
  education: { degree: string; school: string; year: string }[];
  skills: string[];
  certifications: string[];
};

export type Seniority = "Júnior" | "Pleno" | "Sênior";
export type WorkMode = "Remoto" | "Híbrido" | "Presencial";

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  seniority: Seniority;
  mode: WorkMode;
  area: string;
  salary: string;
  description: string;
  required: string[];
  niceToHave: string[];
  benefits: string[];
  keywords: string[];
};

export const profiles: Profile[] = [
  {
    id: "frontend",
    name: "Ana Souza",
    title: "Desenvolvedora Front-end",
    email: "ana.souza@email.com",
    phone: "(11) 98888-1234",
    location: "São Paulo, SP",
    linkedin: "linkedin.com/in/anasouza",
    summary:
      "Desenvolvedora front-end com 5 anos de experiência criando interfaces web performáticas e acessíveis. Experiência com bibliotecas modernas e trabalho em times ágeis.",
    experiences: [
      {
        role: "Desenvolvedora Front-end Pleno",
        company: "Fintech Lumen",
        period: "2022 – Atual",
        bullets: [
          "Desenvolvi telas do app web de investimentos usando React e TypeScript",
          "Participei da criação do design system interno com Storybook",
          "Melhorei a performance do carregamento inicial em 40%",
          "Escrevi testes unitários com Jest",
        ],
      },
      {
        role: "Desenvolvedora Front-end Júnior",
        company: "Agência Pixel",
        period: "2019 – 2022",
        bullets: [
          "Criei landing pages responsivas com HTML, CSS e JavaScript",
          "Integrei APIs REST em projetos de e-commerce",
          "Colaborei com designers usando Figma",
        ],
      },
    ],
    education: [{ degree: "Bacharelado em Ciência da Computação", school: "USP", year: "2019" }],
    skills: ["JavaScript", "React", "TypeScript", "CSS", "HTML", "Jest", "Figma", "Git", "Storybook", "REST"],
    certifications: ["Meta Front-End Developer Certificate"],
  },
  {
    id: "pm",
    name: "Bruno Lima",
    title: "Product Manager",
    email: "bruno.lima@email.com",
    phone: "(21) 97777-5678",
    location: "Rio de Janeiro, RJ",
    linkedin: "linkedin.com/in/brunolima",
    summary:
      "Product Manager com 6 anos de experiência em produtos digitais B2C. Foco em descoberta de produto, priorização e colaboração com engenharia e design.",
    experiences: [
      {
        role: "Product Manager",
        company: "MarketPlace Já",
        period: "2021 – Atual",
        bullets: [
          "Liderei o squad de checkout com 8 pessoas",
          "Defini OKRs trimestrais e roadmap do produto",
          "Aumentei a conversão do checkout em 18% com testes A/B",
          "Conduzi entrevistas de discovery com usuários",
        ],
      },
      {
        role: "Analista de Produto",
        company: "EduTech Saber",
        period: "2018 – 2021",
        bullets: ["Escrevi histórias de usuário e critérios de aceite", "Acompanhei métricas no Amplitude"],
      },
    ],
    education: [{ degree: "Administração", school: "FGV", year: "2018" }],
    skills: ["Discovery", "Roadmap", "OKRs", "Testes A/B", "SQL", "Amplitude", "Scrum", "Jira"],
    certifications: ["CSPO – Certified Scrum Product Owner"],
  },
  {
    id: "data",
    name: "Carla Mendes",
    title: "Analista de Dados",
    email: "carla.mendes@email.com",
    phone: "(31) 96666-9012",
    location: "Belo Horizonte, MG",
    linkedin: "linkedin.com/in/carlamendes",
    summary:
      "Analista de dados com 4 anos de experiência transformando dados em decisões de negócio. Experiência com dashboards, SQL e Python.",
    experiences: [
      {
        role: "Analista de Dados Pleno",
        company: "Varejo Mais",
        period: "2021 – Atual",
        bullets: [
          "Construí dashboards em Power BI para a diretoria comercial",
          "Automatizei relatórios semanais com Python, economizando 10h por semana",
          "Escrevi consultas SQL complexas sobre o data warehouse",
        ],
      },
      {
        role: "Estagiária de BI",
        company: "Banco Horizonte",
        period: "2020 – 2021",
        bullets: ["Apoiei a limpeza e validação de bases de dados em Excel"],
      },
    ],
    education: [{ degree: "Estatística", school: "UFMG", year: "2020" }],
    skills: ["SQL", "Python", "Power BI", "Excel", "Pandas", "Estatística"],
    certifications: ["Microsoft PL-300 Power BI Data Analyst"],
  },
];

export const jobs: Job[] = [
  {
    id: "job-1",
    title: "Desenvolvedor(a) Front-end Sênior",
    company: "Nuvem Pay",
    location: "São Paulo, SP",
    seniority: "Sênior",
    mode: "Remoto",
    area: "Front-end",
    salary: "R$ 14.000 – 18.000",
    description:
      "Buscamos pessoa desenvolvedora front-end sênior para liderar a evolução do nosso app web. Você vai trabalhar com React, TypeScript e Next.js, garantindo acessibilidade, performance e testes automatizados. Experiência com design system, GraphQL e CI/CD é essencial. Diferenciais: Tailwind CSS, Cypress e mentoria de pessoas mais novas.",
    required: ["5+ anos com React", "TypeScript avançado", "Next.js", "Testes automatizados", "Acessibilidade (WCAG)"],
    niceToHave: ["Tailwind CSS", "Cypress", "GraphQL", "Mentoria técnica"],
    benefits: ["100% remoto", "Plano de saúde", "Stock options", "Auxílio home office"],
    keywords: ["React", "TypeScript", "Next.js", "Acessibilidade", "Performance", "Design System", "GraphQL", "CI/CD", "Tailwind CSS", "Cypress", "Testes"],
  },
  {
    id: "job-2",
    title: "Product Manager Pleno – Pagamentos",
    company: "Banco Aurora",
    location: "Rio de Janeiro, RJ",
    seniority: "Pleno",
    mode: "Híbrido",
    area: "Produto",
    salary: "R$ 12.000 – 15.000",
    description:
      "Procuramos PM para o time de pagamentos. Responsável por discovery, roadmap, definição de OKRs e priorização do backlog. Esperamos experiência com métricas de produto, SQL, testes A/B e comunicação com stakeholders. Diferenciais: experiência em fintech e Pix.",
    required: ["3+ anos como PM", "Discovery de produto", "Definição de OKRs", "Análise com SQL"],
    niceToHave: ["Fintech", "Pix", "Amplitude"],
    benefits: ["Híbrido 2x semana", "PLR", "Vale refeição", "Gympass"],
    keywords: ["Discovery", "Roadmap", "OKRs", "Backlog", "SQL", "Testes A/B", "Stakeholders", "Métricas", "Fintech", "Pix"],
  },
  {
    id: "job-3",
    title: "Analista de Dados Júnior",
    company: "LogTech Rotas",
    location: "Belo Horizonte, MG",
    seniority: "Júnior",
    mode: "Presencial",
    area: "Dados",
    salary: "R$ 5.000 – 6.500",
    description:
      "Vaga para analista de dados júnior. Você vai criar dashboards em Power BI, escrever consultas SQL e apoiar análises com Python. Conhecimento de Excel avançado e estatística básica. Diferencial: ETL e Airflow.",
    required: ["SQL", "Power BI", "Excel avançado"],
    niceToHave: ["Python", "ETL", "Airflow"],
    benefits: ["Vale transporte", "Plano odontológico", "Cursos pagos"],
    keywords: ["SQL", "Power BI", "Python", "Excel", "Dashboards", "Estatística", "ETL", "Airflow"],
  },
  {
    id: "job-4",
    title: "Engenheiro(a) de Dados Sênior",
    company: "Saúde Conecta",
    location: "Remoto – Brasil",
    seniority: "Sênior",
    mode: "Remoto",
    area: "Dados",
    salary: "R$ 16.000 – 21.000",
    description:
      "Construa pipelines de dados escaláveis em nuvem. Requisitos: Python, Spark, SQL, Airflow, AWS e modelagem de data warehouse. Experiência com dbt e governança de dados. Diferencial: Kafka e Terraform.",
    required: ["Python", "Spark", "Airflow", "AWS", "Modelagem de dados"],
    niceToHave: ["dbt", "Kafka", "Terraform"],
    benefits: ["Remoto", "Plano de saúde premium", "Bônus anual", "Licença parental estendida"],
    keywords: ["Python", "Spark", "SQL", "Airflow", "AWS", "Data Warehouse", "dbt", "Governança", "Kafka", "Terraform"],
  },
];

export const STAGES = ["Salva", "Currículo Gerado", "Aplicado", "Entrevista", "Finalizado"] as const;
export type Stage = (typeof STAGES)[number];

export type Application = {
  id: string;
  jobId: string;
  stage: Stage;
  resumeVersion?: string;
  atsScore?: number;
  resume?: Profile;
  updatedAt: string;
};

export const initialApplications: Application[] = [
  { id: "a1", jobId: "job-1", stage: "Aplicado", resumeVersion: "v2 – Nuvem Pay", atsScore: 86, updatedAt: "2026-10-02" },
  { id: "a2", jobId: "job-3", stage: "Salva", updatedAt: "2026-10-05" },
  { id: "a3", jobId: "job-2", stage: "Entrevista", resumeVersion: "v1 – Banco Aurora", atsScore: 79, updatedAt: "2026-09-28" },
];
