const { createHash } = await import('node:crypto');

export function createUID(seed: string | null)
{
    if(seed)
        return createHash('sha1').update(seed.toString()).digest('base64');
    else 
        return "null_seed";
}