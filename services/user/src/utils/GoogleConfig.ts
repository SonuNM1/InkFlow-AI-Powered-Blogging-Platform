import {google} from 'googleapis'
import dotenv from 'dotenv'

dotenv.config() ; 

const GOOGLE_CLIENT_ID = process.env.Google_Client_id
const GOOGLE_CLIENT_SECRET = process.env.Google_Client_Secret

export const OAuth2Client= new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    "http://localhost:3000"
)