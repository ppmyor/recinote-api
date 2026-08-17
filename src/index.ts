import { app } from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`recinote-api listening on port ${env.port} (${env.nodeEnv})`);
});
