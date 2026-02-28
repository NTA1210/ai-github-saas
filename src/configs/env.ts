import z from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NEXT_PUBLIC_BASE_URL: z.string(),
  // Database
  DATABASE_URL: z.string(),
  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string(),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string(),
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: z.string(),
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: z.string(),
  NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL: z.string(),
  NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL: z.string(),
  // OpenAI
  OPENAI_API_KEY: z.string(),
  // GitHub
  GITHUB_PAT: z.string(),
  // Pinecone
  PINECONE_API_KEY: z.string(),
  PINECONE_INDEX: z.string(),

  // Supabase
  SUPABASE_PROJECT_URL: z.string(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_BUCKET_NAME: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
});

type Env = z.infer<typeof envSchema>;

export const envValidated = () => {
  try {
    envSchema.parse(process.env);
    console.log("✅Environment variables validated successfully");

    return true;
  } catch (error: any) {
    console.log(error.message);
    process.exit(1);
  }
};

export const env: Env = {
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL!,
  DATABASE_URL: process.env.DATABASE_URL!,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY!,
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL!,
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL!,
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL:
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL!,
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL:
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL!,
  NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL:
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL!,
  NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL:
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL!,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
  GITHUB_PAT: process.env.GITHUB_PAT!,
  PINECONE_API_KEY: process.env.PINECONE_API_KEY!,
  PINECONE_INDEX: process.env.PINECONE_INDEX!,
  SUPABASE_PROJECT_URL: process.env.SUPABASE_PROJECT_URL!,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  SUPABASE_BUCKET_NAME: process.env.SUPABASE_BUCKET_NAME!,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
};
