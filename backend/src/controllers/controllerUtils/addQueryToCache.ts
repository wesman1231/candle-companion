import dotenv from 'dotenv';
dotenv.config()
import { Redis as Valkey } from 'ioredis';

export async function addToCache(cacheKey: string, data:object){
     const valkey = new Valkey(process.env.CACHE_URI!, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
            // stop retrying after 5 attempts
            if (times > 5) {
                return null;
            }

            // exponential-ish backoff
            return Math.min(times * 200, 2000);
        },
    });
    
    valkey.on('error', (err) => {
        console.error('Valkey connection error:', err.message);
    });

    try{
        await valkey.set(cacheKey, JSON.stringify(data));
    }
    catch(error){
        console.error(error);
    }
    finally{
        valkey.quit();
    }
}