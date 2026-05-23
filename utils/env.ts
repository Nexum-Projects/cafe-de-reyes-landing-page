type Env = {
  NEXT_PUBLIC_API_URL: string;
  NEXT_PUBLIC_PROJECT_ID?: string;
  NEXT_PUBLIC_SITE_NAME: string;
  NEXT_PUBLIC_SITE_URL?: string;
};

function readEnv(): Env {
  return {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8080/api",
    NEXT_PUBLIC_PROJECT_ID: process.env.NEXT_PUBLIC_PROJECT_ID || undefined,
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME ?? "Cafe de Reyes",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || undefined,
  };
}

export const env = readEnv();
