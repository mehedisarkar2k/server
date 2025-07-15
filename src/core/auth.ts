import { ENV } from '@/config';
import { betterAuth } from 'better-auth';
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { DB } from './db';

export const auth = betterAuth({
    secret: ENV.BETTER_AUTH_SECRET,
    database: mongodbAdapter(DB!),
})