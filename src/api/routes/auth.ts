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
                
                req.user = {
                    display_name: user.name,
                    last_name: user.family_name,
                    first_name: user.given_name,
                    email: user.email,
                    email_verified: user.email_verified,
                };

                (req.session as any).user = req.user;

            }

            return next();
        } catch (error) {
            console.log(error);
            return next();
        }
    });

    app.get("/", async (req: Request, res: Response) => {

        if (req.oidc.isAuthenticated()) {
            res.redirect(FRONTEND_URL+"/muck-up/synonyms");
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

                // Use axios.get with the provided URL
                const result = await axios.get(url);
		        console.log("RESULT: ", result);
                if (result?.statusText === 'OK') {
                    req.appSession = undefined;
                    req.session.destroy();
                    res.status(200);
                    return res.send({
                        data: {
                            logout: true,
                            redirect: AUTH_REDIRECT,
                        },
                    });
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