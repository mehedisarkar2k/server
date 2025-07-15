import { Router } from "express";
import { validateRequest, asyncHandler } from "@/middlewares";

import { SignInSchema, SignUpSchema } from "./auth.model";
import { authRateLimit } from "@/config";

const authRouter = Router();

// Apply strict rate limiting to all auth routes
authRouter.use(authRateLimit);

authRouter.post("/signup", validateRequest(SignUpSchema), asyncHandler(async (req, res) => {
    // Handle user signup
    // req.body is now type-safe and validated
}));

authRouter.post("/signin", validateRequest(SignInSchema), asyncHandler(async (req, res) => {
    // Handle user signin
    // req.body is now type-safe and validated
}));

export { authRouter };
