export function createTokens(title: string | null){ 
    var tokens = title?.split(" ");
    var tags: string[] = [];
    if (tokens != null) {
        for (let i = 0; i < tokens.length; i++) {
            tags.push(tokens[i]);
        }
    }
    return tags;
}

