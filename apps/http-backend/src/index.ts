import "dotenv/config";
import http from "http";
import app from "./app.js";
const PORT = Number(process.env.PORT) || 8000;
const NODE_ENV = process.env.NODE_ENV ?? "dev";

if (!PORT) {
  console.error("PORT is not defined or Invalid");
  process.exit(1);
}

const startServer = () => {
  try {
    const httpServer = http.createServer(app);
    httpServer.listen(PORT, () => {
      console.log("=================================");
      console.log(`Server running successfully`);
      console.log(`Environment : ${NODE_ENV}`);
      console.log(`Port        : ${PORT}`);
      console.log("=================================");
    });

    const shutDown = (AbortSignal: AbortSignal) => {
      console.log(`Recieved ${AbortSignal}. Shutting down gracefully...`);
      httpServer.close(() => {
        console.log("HTTP server closed.");
        process.exit(0);
      });
    };
    process.on("SIGTERM", shutDown);
    process.on("SIGINT", shutDown);
  } catch (error) {
    console.error("Application start-up failed: ", error);
    process.exit(1);
  }
};

startServer();

process.on("uncaughtException", (error) => {
  console.error("Uncaught exceptions: ", error);
  process.exit(1);
});
process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection: ", error);
  process.exit(1);
});
