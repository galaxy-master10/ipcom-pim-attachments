// authService.js

import { PublicClientApplication } from '@azure/msal-browser'
import msalConfig, { loginRequest } from '@/auth/msalConfig.js'
import { clearApiKey } from "@/api/config/axiosConfig.js";

class AuthService {
    constructor() {
        this.MyMSALObj = new PublicClientApplication(msalConfig);
        this.account = null;
        this.isInitialized = false;
        this.tokenExpirationTimer = null;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            await this.MyMSALObj.initialize();
            this.isInitialized = true;


            const account = this.getActiveAccount();
            if (account) {
                this.account = account;
                await this.validateToken();
            }
        } catch (error) {
            console.error("MSAL initialization error:", error);
            this.clearSession();
            throw error;
        }
    }

    async login() {
        try {
            await this.initialize();
            return this.MyMSALObj.loginRedirect(loginRequest);
        } catch (error) {
            throw error;
        }
    }

    async logout() {
        try {
            await this.initialize();
            const account = this.account || this.getActiveAccount();

            this.clearSession();

            if (account) {
                await this.MyMSALObj.logoutRedirect({
                    account: account,
                    postLogoutRedirectUri: msalConfig.auth.redirectUri,
                });
            }
        } catch (error) {
            this.clearSession();
            throw error;
        }
    }

    clearSession() {
        this.account = null;
        clearApiKey();
        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
            this.tokenExpirationTimer = null;
        }
    }

    getActiveAccount() {
        if (!this.isInitialized) {
            console.warn("Trying to get active account before MSAL is initialized");
            return null;
        }

        const accounts = this.MyMSALObj.getAllAccounts();
        if (accounts.length === 0) {
            return null;
        }

        return accounts[0];
    }

    async validateToken() {
        try {
            const token = await this.getTokenSilently();
            if (!token) {
                this.clearSession();
                return false;
            }

            const tokenClaims = this.parseJwt(token);
            if (!tokenClaims || !tokenClaims.exp) {
                this.clearSession();
                return false;
            }


            const expirationTime = tokenClaims.exp * 1000; // Convert to milliseconds
            const currentTime = Date.now();

            if (currentTime >= expirationTime) {
                console.log("Token has expired");
                this.clearSession();
                return false;
            }


            const timeUntilExpiry = expirationTime - currentTime;
            this.setTokenExpirationTimer(timeUntilExpiry);

            return true;
        } catch (error) {
            console.error("Token validation failed:", error);
            this.clearSession();
            return false;
        }
    }

    setTokenExpirationTimer(timeUntilExpiry) {

        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
        }

        const buffer = 60000; // 1 minute in milliseconds
        const timerDuration = Math.max(0, timeUntilExpiry - buffer);

        this.tokenExpirationTimer = setTimeout(() => {
            console.log("Token expiration timer triggered");
            this.clearSession();

            window.dispatchEvent(new CustomEvent('auth:session-expired'));
        }, timerDuration);

        console.log(`Token expiration timer set for ${Math.floor(timerDuration / 60000)} minutes from now`);
    }

    parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error("Error parsing JWT:", error);
            return null;
        }
    }

    async getToken() {
        try {
            await this.initialize();

            const account = this.account || this.getActiveAccount();
            if (!account) {
                throw new Error("No active account! Verify a user has been signed in.");
            }


            const isValid = await this.validateToken();
            if (!isValid) {
                throw new Error("Token is invalid or expired");
            }

            const response = await this.MyMSALObj.acquireTokenSilent({
                ...loginRequest,
                account: account
            });

            return response.accessToken;
        } catch (error) {
            if (error.name === "InteractionRequiredAuthError") {
                await this.initialize();
                return this.MyMSALObj.acquireTokenRedirect(loginRequest);
            }
            throw error;
        }
    }

    async isAuthenticated() {
        try {
            await this.initialize();


            const account = this.account || this.getActiveAccount();
            if (!account) {
                return false;
            }


            return await this.validateToken();
        } catch (error) {
            console.error("Authentication check failed:", error);
            return false;
        }
    }

    async getTokenSilently() {
        try {
            await this.initialize();

            const account = this.account || this.getActiveAccount();
            if (!account) {
                return null;
            }

            const response = await this.MyMSALObj.acquireTokenSilent({
                ...loginRequest,
                account: account
            });
            return response.accessToken;
        } catch (error) {
            console.error("Silent token acquisition failed", error);
            return null;
        }
    }

    async handleRedirectPromise() {
        try {
            await this.initialize();

            const response = await this.MyMSALObj.handleRedirectPromise();
            if (response) {
                this.account = response.account;


                await this.validateToken();
            }

            return response;
        } catch (error) {
            console.error("Handle redirect promise failed:", error);
            this.clearSession();
            throw error;
        }
    }
}

export default new AuthService();