import express from "express";
import { createApplicationDependencies } from "./composition-root.js";
import { TOKENS } from "./composition/tokens.js";
import { disposeAll } from "./infrastructure/lifecycle/Disposable.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const isProduction = process.env.NODE_ENV === "production";

app.use(express.json());

if (!isProduction) {
  app.use(
    "/dev/api-tester",
    express.static("public/dev-api-tester")
  );

  app.get("/", (_request, response) => {
    response.redirect("/dev/api-tester");
  });
}

const dependencies = createApplicationDependencies();
const { container, disposables, logger, userController } = dependencies;

app.use((_request, response, next) => {
  // Mỗi request sẽ tạo một requestIdGenerator mới
  const requestIdGenerator = container.resolve(TOKENS.requestIdGenerator);
  const requestId = requestIdGenerator.generate();

  response.setHeader("X-Request-Id", requestId);
  next();
});

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

app.post("/users", userController.register);
app.get("/users/:id", userController.getById);

const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);

  if (!isProduction) {
    console.log(
      `API tester is running at http://localhost:${port}/dev/api-tester`
    );
  }
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

    // Gọi disposeAll() sau để đảm bảo khi đóng server không còn request nào tới chúng.
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
