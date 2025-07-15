import { Router } from "express";
import { validateRequest, asyncHandler } from "@/middlewares";
import { AuthController } from "./auth.controller";
import { SignInSchema, SignUpSchema } from "./auth.model";
import { authRateLimit } from "@/config";

const authRouter = Router();

// Apply strict rate limiting to all auth routes
authRouter.use(authRateLimit);

// Sign up route
authRouter.post("/signup",
    validateRequest(SignUpSchema),
    asyncHandler(AuthController.signUp)
);

// Sign in route
authRouter.post("/signin",
    validateRequest(SignInSchema),
    asyncHandler(AuthController.signIn)
);

// Sign out route
authRouter.post("/signout",
    asyncHandler(AuthController.signOut)
);

// Get session route
authRouter.get("/session",
    asyncHandler(AuthController.getSession)
);

export { authRouter };
