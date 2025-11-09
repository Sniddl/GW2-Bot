import { Client, GatewayIntentBits } from "discord.js";
import puppeteer from "puppeteer";
import dotenv from "dotenv";
import { formatDistanceToNow } from "date-fns";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const TOKEN = process.env.DISCORD_TOKEN; // replace with your bot token
const URL = process.env.WORLD_BOSSES_URL;

async function getNextBosses(count = 6) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Optional: spoof headers to avoid Cloudflare/bot detection
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    );

    await page.goto(URL, { waitUntil: "networkidle2" });

    // Wait for the divs containing the events
    await page.waitForSelector("div[title*='-']", { timeout: 1000 });

    const bosses = await page.evaluate((max) => {
      const divs = Array.from(document.querySelectorAll("div[title*='-']"));
      return divs
        .slice(10, 10 + max)
        .map((div) => {
          const title = div.getAttribute("title"); // e.g. "09:00 - Admiral Taidha Covington: [&BKgBAAA=]"
          if (!title) return null;

          return title;
        })
        .filter(Boolean);
    }, count);

    const bossesOutput = bosses.map((title) => {
      const match = title.match(/^(\d{2}):(\d{2}) - (.+): \[(&[^\]]+)\]$/);
      if (!match) return null;

      const [, hourStr, minuteStr, boss, waypoint] = match;
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);

      // create a Date object for today at that hour:minute UTC
      const now = new Date();
      let bossTime = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          hour,
          minute,
          0,
        ),
      );

      const humanTime = formatDistanceToNow(bossTime, {
        addSuffix: true,
      });

      return `${boss} at ${waypoint} ${humanTime}`;
    });

    // console.log({ bossesOutput });
    return bossesOutput.length ? bossesOutput : ["⚠️ No events found."];
  } catch (err) {
    console.error("Error scraping GW2 Ninja:", err);
    return ["⚠️ Error fetching GW2 bosses."];
  } finally {
    if (browser) await browser.close();
  }
}

client.on("messageCreate", async (msg) => {
  if (msg.content.trim().toLowerCase() === "!bosses") {
    await msg.channel.send("Fetching next world bosses. Please wait ⏳");
    const bosses = await getNextBosses(6);
    msg.channel.send("**Next World Bosses:**\n" + bosses.join("\n"));
  }
});

client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(TOKEN);

// const bosses = await getNextBosses(6);
// console.log(bosses.join("\n"));
