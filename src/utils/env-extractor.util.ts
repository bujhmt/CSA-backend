export function envExtractor(): string {
    switch (process.env.NODE_ENV) {
    case 'production':
        return '.env.production';
    default:
        return '.env.development';
    }
}
