import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import lusca from 'lusca';
import passport from 'passport';
import path from 'path';

import businessController from './controllers/business';
import { assignReferenceId } from './controllers/common';
import userController from './controllers/user';
import vouchersController from './controllers/voucherOptions';
import { decodeFirebaseToken, isAuthorized } from './middlewares/authentication';

// Create Express server
const app = express();

// Express configuration
app.set("port", process.env.PORT || 8000);
app.use(compression());
app.use(cors());
app.use(assignReferenceId);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// TODO[sebastian]: Add Redis session store
// app.use(session({
//     resave: true,
//     saveUninitialized: true,
//     secret: SESSION_SECRET,
//     store: new MongoStore({
//         url: mongoUrl,
//         autoReconnect: true
//     })
// }));
app.use(passport.initialize());
app.use(passport.session());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.user = req.user;
  next();
});
// app.use((req, res, next) => {
//     // After successful login, redirect back to the intended page
//     if (!req.user &&
//     req.path !== '/login' &&
//     req.path !== '/signup' &&
//     !req.path.match(/^\/auth/) &&
//     !req.path.match(/\./)) {
//         req.session.returnTo = req.path;
//     } else if (req.user &&
//     req.path == '/account') {
//         req.session.returnTo = req.path;
//     }
//     next();
// });

/**
 * Primary app routes.
 */
app.use("/api/user", userController);
app.use("/api/business", decodeFirebaseToken, isAuthorized, businessController);
app.use("/api/vouchers", vouchersController);
/**
 * OAuth authentication routes. (Sign in)
 */
// app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
// app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
//     res.redirect(req.session.returnTo || '/');
// });

// Serve the static files from React app
app.use(express.static(path.join(__dirname + "/../client/build/")));
/**
 * React Application
 */
app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname + "/../client/build/"));
});


app.use((err: Error, req: Request, res: Response) => {
  console.log(err);
});
export default app;
