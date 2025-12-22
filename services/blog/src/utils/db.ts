import {neon} from '@neondatabase/serverless'
import dotenv from 'dotenv'
dotenv.config() 

export const sql = neon(process.env.DB_URL as string) ; 

/*
NeonDB is a serverless PostgresSQL database (cloud-hosted). Serverless & Auto-scaling. 

Think of Neon as: "MongoDB Atlas, but for PostgreSQL".
*/