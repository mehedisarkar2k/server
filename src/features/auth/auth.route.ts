import { Router } from "express";
import { validateRequest } from "@/middlewares";

import { SignInSchema, SignUpSchema } from "./auth.model";

const authRouter = Router();

authRouter.post("/signup", validateRequest(SignUpSchema), async (req, res) => {
    // Handle user signup
    // req.body is now type-safe and validated
});

authRouter.post("/signin", validateRequest(SignInSchema), async (req, res) => {
    // Handle user signin
    // req.body is now type-safe and validated
});

export { authRouter };
