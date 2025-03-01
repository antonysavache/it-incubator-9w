import { Router } from "express";
import { authController } from "../../../configs/compositions/auth.composition";
import { authValidationMiddleware } from "../../../configs/compositions/auth.composition";
import {jwtAuthMiddleware} from "../../../shared/infrastructures/middlewares/jwt-auth.middleware";

export const authRouter = Router();

authRouter.post('/login', authController.login);

authRouter.post('/registration',
    authValidationMiddleware.registration,
    authController.register
);

authRouter.post('/registration-confirmation',
    authValidationMiddleware.confirmRegistration,
    authController.confirmRegistration
);

authRouter.post('/registration-email-resending',
    authValidationMiddleware.resendEmail,
    authController.resendConfirmation
);

authRouter.post('/refresh-token', authController.refreshToken);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', jwtAuthMiddleware, authController.getMe);