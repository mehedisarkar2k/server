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