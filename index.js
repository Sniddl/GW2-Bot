import { Client, GatewayIntentBits } from "discord.js";
import puppeteer from "puppeteer";
import dotenv from "dotenv";

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

async function getNextBosses() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: "networkidle2" });

    // Wait for the "Current events" section to load
    await page.waitForSelector(".world_boss_table", { timeout: 2000 });

    // Scrape the next 6 world bosses
    const bosses = await page.evaluate(() => {
      const table = document.querySelector(".world_boss_table");
      if (!table) return [];

      const rows = Array.from(table.querySelectorAll("tr")).slice(1); // skip header
      const events = rows
        .map((row) => {
          const cells = row.querySelectorAll("td");
          const boss = cells[0]?.innerText.trim();
          const time = cells[1]?.innerText.trim();
          const countdown = cells[2]?.innerText.trim();
          const waypoint = cells[5]?.innerText.trim();
          return time && boss ? `${boss} - ${countdown} ${waypoint}` : null;
        })
        .filter(Boolean);

      return events.slice(0, 6);
    });

    return bosses.length ? bosses : ["⚠️ No events found."];
  } catch (err) {
    console.error("Error scraping GW2 bosses:", err);
    return ["⚠️ Error fetching GW2 bosses. Check the wiki."];
  } finally {
    if (browser) await browser.close();
  }
}

client.on("messageCreate", async (msg) => {
  if (msg.content.trim().toLowerCase() === "!bosses") {
    msg.channel.send("Fetching next world bosses!");

    const bosses = await getNextBosses();
    const reply = bosses.join("\n");
    msg.channel.send("**Next World Bosses:**\n" + reply);
  }
});

client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(TOKEN);
