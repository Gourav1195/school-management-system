declare namespace NodeJS {
  interface ProcessEnv {
    JWT_SECRET: string;
    DATABASE_URL: string;
    JWT_SECRET:string;
    PRISMA_CLI_QUERY_ENGINE_TYPE:string;
    GROQ_CLOUD_API_KEY:string;
  }
}
