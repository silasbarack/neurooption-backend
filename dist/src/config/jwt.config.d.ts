export declare function getJwtSecret(): string;
export declare const jwtConfig: () => {
    jwt: {
        secret: string;
        expiresIn: string;
        adminExpiresIn: string;
    };
};
