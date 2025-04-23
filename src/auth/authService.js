// authService.js

import { PublicClientApplication } from '@azure/msal-browser'
import msalConfig, { loginRequest } from '@/auth/msalConfig.js'
import {clearApiKey} from "@/api/config/axiosConfig.js";

class AuthService {
    constructor() {

        this.MyMSALObj = new PublicClientApplication(msalConfig);
        this.account = null;
        this.isInitialized = false;
    }


    async initialize() {
        if (this.isInitialized) return;

        try {

            await this.MyMSALObj.initialize();
            this.isInitialized = true;
        } catch (error) {
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
            await this.MyMSALObj.logoutRedirect({
                account: account,
                postLogoutRedirectUri: msalConfig.auth.redirectUri,
            });
            this.account = null;
            clearApiKey();
        } catch (error) {

            throw error;
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

    async getToken() {
        try {
            // Make sure MSAL is initialized
            await this.initialize();

            const account = this.account || this.getActiveAccount();
            if (!account) {
                throw new Error("No active account! Verify a user has been signed in.");
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


            const accounts = this.MyMSALObj.getAllAccounts();
            return accounts.length > 0;
        } catch (error) {
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
                console.log(response)
            }


            return response;
        } catch (error) {
            console.error("Silent token handleRedirectPromise", error);
            throw error;
        }
    }
}

export default new AuthService();