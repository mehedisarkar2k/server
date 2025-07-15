import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import path from 'node:path';
import process from 'node:process';
import z from 'zod';

console.log(process.cwd());

expand(
    config({
        path: path.resolve(
            process.cwd(),
            process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
        ),
        quiet: process.env.NODE_ENV === 'production',
    }),

);

const EnvSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']),
    PORT: z.coerce.number().default(8000),
    MONGO_URI: z.url(),
    BETTER_AUTH_SECRET: z.string().min(6, 'BETTER_AUTH_SECRET must be set'),
    ALLOWED_ORIGINS: z.string().optional().default('http://localhost:3000,http://localhost:3001,http://localhost:5173'),
})

export type Env = z.infer<typeof EnvSchema>

const result = EnvSchema.safeParse(process.env);

if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(result.error.flatten().fieldErrors, null, 2));
    process.exit(1);
}

const ENV = result.data;

export { ENV };