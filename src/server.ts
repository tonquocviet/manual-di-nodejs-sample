import express from "express";
import { createApplicationDependencies } from "./composition-root.js";
import { disposeAll } from "./infrastructure/lifecycle/Disposable.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());

const dependencies = createApplicationDependencies();
const { disposables, logger, userController } = dependencies;

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

app.post("/users", userController.register);
app.get("/users/:id", userController.getById);

const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

let isShuttingDown = false;

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  logger.info("Shutdown signal received", {
    signal
  });

  try {
    // Dừng Server trước để không nhận request mới
    await closeServer();

    // Gọi disposeAll() gọi sau để đảm bảo khi đóng servẻ không còn request nào tới chúng
    await disposeAll(disposables);

    logger.info("Application dependencies disposed");
    process.exit(0);
  } catch (error) {
    logger.error("Failed to shutdown cleanly", {
      error
    });
    process.exit(1);
  }
}

function closeServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

// SIGINT thường xảy ra khi dev bấm Ctrl+C.
// process.once bảo đảm shutdown chỉ chạy một lần cho signal này.
process.once("SIGINT", () => {
  // shutdown là async; void cho biết ta chủ động không await trong callback sync.
  void shutdown("SIGINT");
});

// SIGTERM thường được gửi bởi Docker/Kubernetes/platform khi muốn app dừng gracefully.
// Handler này giúp app đóng HTTP server và dispose dependencies trước khi exit.
process.once("SIGTERM", () => {
  // shutdown là async; void cho biết ta chủ động không await trong callback sync.
  void shutdown("SIGTERM");
});
