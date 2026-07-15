import type { Request, Response } from "express";
import type { UserService } from "../application/UserService.js";

export class UserController {
  constructor(private readonly userService: UserService) {}

  register = async (request: Request, response: Response): Promise<void> => {
    try {
      const user = await this.userService.register({
        name: String(request.body.name ?? ""),
        email: String(request.body.email ?? "")
      });

      response.status(201).json(user);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";

      const statusCode =
        message === "Email already exists" ? 409 : 400;

      response.status(statusCode).json({ message });
    }
  };

  getById = async (request: Request, response: Response): Promise<void> => {
    try {
      const user = await this.userService.getById(String(request.params.id));

      response.status(200).json(user);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";

      const statusCode =
        message === "User not found" ? 404 : 400;

      response.status(statusCode).json({ message });
    }
  };
}
