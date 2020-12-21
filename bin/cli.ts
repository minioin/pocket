import GetPocket from "../lib/client.ts";
import Denomander from "https://x.nest.land/denomander@0.63.2/mod.ts";
import { opn } from "https://denopkg.com/hashrock/deno-opn/opn.ts";
import { GetResponse } from "../lib/client.ts";

const consumer_key = Deno.env.get("POCKET_CONSUMER_KEY") || "";
const access_token = Deno.env.get("POCKET_ACCESS_TOKEN") || "";

if (consumer_key === "" || access_token === "") {
  console.error("Couldn't find POCKET_CONSUMER_KEY or POCKET_ACCESS_TOKEN.");
}

interface Options {
  open: boolean;
  archive: boolean;
  delete: boolean;
}

const program = new Denomander({
  app_name: "Pockety",
  app_description: "Pockety pocket",
  app_version: "1.0.0",
});

program
  .command("get", "Get urls")
  .option("-a --archive", "Archive thos urls")
  .option("-n --number", "Fetch n number of items")
  .option("-s --skip", "Skip first n items")
  .option("-o --open", "Open those urls")
  .option("-v --view", "View those urls on console.")
  .parse(Deno.args);

if (program.get) {
  const count = (program.number && Number.parseInt(program.number)) || 10;
  const offset = (program.skip && Number.parseInt(program.skip)) || 0;
  let pocket = new GetPocket(consumer_key, access_token);
  try {
    const res: GetResponse = await pocket.get({ count, offset });

    if (program.view || !(program.open || program.archive)) {
      const list = res.list;
      for (let key in res.list) {
        console.log(
          `${key}|${list[key].resolved_title}|${list[key].resolved_url}`,
        );
      }
    }

    if (program.open) {
      let promises = [];
      for (let key in res.list) {
        promises.push(opn(res.list[key].resolved_url));
      }
      await Promise.all(promises);
    }

    if (program.archive) {
      let items = [];
      for (let key in res.list) {
        items.push({ item_id: Number.parseInt(res.list[key].item_id) });
      }
      let resa = await pocket.archive(items);
    }
  } catch (e) {
    console.error(e.message);
  }
}
