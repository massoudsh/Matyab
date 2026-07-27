import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();

app.listen(env.port, () => {
  console.log(`متریاب (MatYab) backend روی پورت ${env.port} در حال اجراست`);
});
