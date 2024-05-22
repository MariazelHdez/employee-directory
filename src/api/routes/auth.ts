import express, { Express, NextFunction, Request, Response } from "express";
import { auth, requiresAuth } from 'express-openid-connect';
import session from "express-session";
import { 
    BASE_URL,
    CLIENT_SECRET,
    CLIENT_ID,
    ISSUER_BASE_URL,
    FRONTEND_URL,
    AUTH_REDIRECT,
    APP_STAFF_DIRECTORY_URL,
} from '../config';
import axios from "axios";

export function configureAuthentication(app: Express) {

    app.use(session({
        secret: "supersecret",
        resave: true,
        saveUninitialized: true
    }));

    app.use(auth({
        authRequired: false,
        auth0Logout: false,
        baseURL: BASE_URL,
        clientID: CLIENT_ID,
        issuerBaseURL: ISSUER_BASE_URL,
        secret: CLIENT_SECRET,
        routes: {
            login: "/api/auth/login",
            logout: "/api/auth/logout",
        },
        authorizationParams: {
            response_type: "code",
            audience: "",
            scope: "openid profile email",
        },
    }));

    app.use("/", async (req: Request | any, res: Response, next: NextFunction) => {
        try {

            if (req.oidc.isAuthenticated()) {
                const user = req.oidc.user;
                const email = user.email.trim().toLowerCase();

                const response = await axios.get(`${APP_STAFF_DIRECTORY_URL}/GetUserByEmail`, {
                    params: { email },
                });

                if (response.data && response.data.user && response.data.user.length > 0) {
                    req.user = {
                        display_name: user.name,
                        last_name: user.family_name,
                        first_name: user.given_name,
                        email: user.email,
                        email_verified: user.email_verified,
                    };

                    (req.session as any).user = req.user;
                    req.session.emailExists = true;
                } else {
                    req.session.emailExists = false;
                    console.log(`User email ${email} does not exist in the database.`);

                    const claims = req.oidc.idTokenClaims;

                    if (claims) {
                        const returnToUrl = encodeURIComponent(`${FRONTEND_URL}?loginFailed=true`);
                        const url = `${claims.iss}v2/logout?returnTo=${returnToUrl}&client_id=${claims.aud}`;

                        const result = await axios.get(url);
                        if (result?.statusText === 'OK') {
                            req.appSession = undefined;
                            res.clearCookie('connect.sid', { path: '/', httpOnly: true, secure: true });
                            res.clearCookie('appSession', { path: '/', httpOnly: true, secure: true });
                            res.clearCookie('auth_verification', { path: '/', httpOnly: true, secure: true });
                            req.session.destroy((err: NodeJS.ErrnoException | null) => {
                                if (err) {
                                    console.error('Session destruction failed:', err);
                                    throw err;
                                }

                                res.redirect(url);
                            });
                        }
                    }else{
                        res.status(401).send('Unauthorized: No active session');
                    }

                }
            }

            return next();
        } catch (error) {
            console.error(error);
            return next();
        }
    });

    app.get("/", async (req: Request, res: Response) => {

        if (req.oidc.isAuthenticated() && req.session?.emailExists == true) {
            res.redirect(FRONTEND_URL+"/settings/synonyms");
        } else {
            // this is hard-coded to accomodate strage behaving in sendFile not allowing `../` in the path.
            // this won't hit in development because web access is served by the Vue CLI - only an issue in Docker
            res.sendFile("/home/node/app/dist/web/index.html");
        }
    });

    app.get("/api/auth/is-authenticated", (req: Request, res: Response) => {

        try {
            if (req.oidc.isAuthenticated()) {
                return res.send({ isAuth: true, data: req.user });
            }else{
                res.send( {
                    isAuth: false,
                    message: 'Not Authenticated'
                });
            }
            
        } catch (error) {
            console.log(error);
            return res.send( {
                status: 200,
                isAuth: false,
                message: 'Not Authenticated'
            });
        }
    });

    app.get('/api/auth/close-session', async (req: any, res: Response) => {
        const claims = req.oidc.idTokenClaims;

        if (claims) {
            try {

                const url = `${claims.iss}v2/logout?returnTo=${FRONTEND_URL}&client_id=${claims.aud}`;
                console.log("URL ", url);

                const result = await axios.get(url);
                if (result.status === 200) {

                    //Delete session cookies
                    req.appSession = undefined;
                    res.clearCookie('connect.sid', { path: '/', httpOnly: true, secure: true });
                    res.clearCookie('appSession', { path: '/', httpOnly: true, secure: true });

                    if (req.session) {
                        req.session.destroy((err: any) => {
                            if (err) {
                                console.error('Error destroying session:', err);
                                return res.status(500).send({
                                    error: {
                                        message: 'Failed to destroy session',
                                    }
                                });
                            }

                            res.status(200).send({
                                data: {
                                    logout: true,
                                    redirect: AUTH_REDIRECT,
                                    logoutExternalUrl: url,
                                    baseUrl: ISSUER_BASE_URL
                                },
                            });
                        });
                    } else {
                        res.status(200).send({
                            data: {
                                logout: true,
                                redirect: AUTH_REDIRECT,
                            },
                        });
                    }
                }
            } catch (error: any) {
                console.log(error);
                return res.status(error.response?.status || 500).send({
                    error: {
                        message: 'Logout failed',
                    },
                });
            }


        }

    });
}