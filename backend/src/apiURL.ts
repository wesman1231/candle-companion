import dotenv from 'dotenv';
dotenv.config();

export function apiURL(){
    let url: string = '';
    if(process.env.ENVIRONMENT === 'dev'){
        url = 'http://localhost'
    }
    else if(process.env.ENVIRONMENT === 'prod'){
        url = 'https://api.candlecompanion.com'
    }

    return url;
}