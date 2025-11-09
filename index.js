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

const sections = [
  {
    name: "World Bosses",
    selector: "#world-bosses + .grid > div",
    group: "Core Tyria",
    hasWaypoint: true,
  },
  {
    name: "Hard World Bosses",
    selector: "#hard-world-bosses + .grid > div",
    group: "Core Tyria",
    hasWaypoint: true,
  },
  {
    name: "Ley-Line Anomaly",
    selector: "#ley-line-anomaly + .grid > div",
    group: "Core Tyria",
    hasWaypoint: true,
  },
  {
    name: "Fractal Incursions",
    selector: "#fractal-incursions + .grid > div",
    group: "Core Tyria",
    hasWaypoint: true,
  },
  {
    name: "EU PVP Tournaments",
    selector: "#eu-pvp-tournaments + .grid > div",
    group: "Core Tyria",
    hasWaypoint: false,
  },
  {
    name: "NA PVP Tournaments",
    selector: "#na-pvp-tournaments + .grid > div",
    group: "Core Tyria",
    hasWaypoint: false,
  },
  {
    name: "Eye of the North",
    selector: "#eye-of-the-north + .grid > div",
    group: "Living World Season 1",
    hasWaypoint: true,
  },
  {
    name: "Scarlets Invasion",
    selector: "#scarlets-invasion + .grid > div",
    group: "Living World Season 1",
    hasWaypoint: true,
  },
];

function parseTime(hourStr, minuteStr) {
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

  return humanTime;
}

async function getAllEvents() {
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
    await page.waitForSelector(sections[0].selector, {
      timeout: 1000,
    });

    const populatedSections = await Promise.all(
      sections.map(async (section) => {
        const titles = await page.evaluate((section) => {
          const divs = Array.from(document.querySelectorAll(section.selector));

          return divs.map((div) => {
            const title = div.getAttribute("title");
            if (!title) return null;

            return title;
          });
        }, section);

        return { ...section, titles };
      }),
    );

    const parsedSections = populatedSections.map((section) => {
      var output = section.titles
        .map((title) => {
          const match = title.match(/^(\d{2}):(\d{2}) -.+$/);
          if (!match) return null;
          const [, hourStr, minuteStr] = match;
          const humanTime = parseTime(hourStr, minuteStr);
          if (section.hasWaypoint) {
            try {
              const [, boss, waypoint] = title.match(
                /^\d{2}:\d{2} - (.+): \[(&[^\]]+)\]$/,
              );
              return `${boss} at ${waypoint} ${humanTime}`;
            } catch (err) {
              return `Nothing is scheduled - ${humanTime}`;
            }
          } else {
            try {
              const [, boss] = title.match(/^\d{2}:\d{2} - (.+)$/);
              return `${boss} ${humanTime}`;
            } catch (err) {
              return `Nothing is scheduled - ${humanTime}`;
            }
          }
        })
        .filter(Boolean)
        .join("\n");
      return { ...section, output };
    });

    const groupedSections = parsedSections.reduce((acc, section) => {
      const key = section.group || "Ungrouped";
      if (!acc[key]) acc[key] = [];
      acc[key].push(section);
      return acc;
    }, {});

    return groupedSections;
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
    const events = await getAllEvents();
    const worldBosses = Object.values(events)
      .flat()
      .find((section) => section.name === "World Bosses");
    msg.channel.send("**Next World Bosses:**\n" + worldBosses.output);
  }

  if (msg.content.trim().toLowerCase() === "!events") {
    await msg.channel.send("Fetching all events. Please wait ⏳");
    const events = await getAllEvents();

    const allEventsOutput = Object.entries(events)
      .map(([group, sections]) => {
        const sectionLines = sections
          .map((s) => `**${s.name}**\n${s.output}`)
          .join("\n");
        return `**===${group}===**\n${sectionLines}`;
      })
      .join("\n\n");

    msg.channel.send(allEventsOutput);
  }
});

client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(TOKEN);
