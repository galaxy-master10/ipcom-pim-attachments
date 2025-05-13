// msalconfig.js
const msalConfig = {
    auth: {
        clientId: 'ce5425aa-2c4a-4ac4-a986-273c2a222168',
        authority: 'https://login.microsoftonline.com/5ee80607-15dc-49f6-ac6c-9f79d2bc312f',
        redirectUri: window.location.origin,

        navigateToLoginRequestUrl: true,
    },
    cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false // Enable cookies for better compatibility
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (!containsPii) {
                    console.log(`MSAL [${level}]: ${message}`);
                }
            },
            logLevel: 3 // Verbose logging during development
        }
    }
}

export const loginRequest = {
    scopes: ["api://ce5425aa-2c4a-4ac4-a986-273c2a222168/Pim"],

};
export default msalConfig;