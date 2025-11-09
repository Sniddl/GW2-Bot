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
  {
    name: "Dry Top",
    selector: "#dry-top + .grid > div",
    group: "Living World Season 2",
    hasWaypoint: true,
  },
  {
    name: "Verdant Brink",
    selector: "#verdant-brink + .grid > div",
    group: "Heart of Thorns",
    hasWaypoint: true,
  },
  {
    name: "Auric Basin",
    selector: "#auric-basin + .grid > div",
    group: "Heart of Thorns",
    hasWaypoint: true,
  },
  {
    name: "Tangled Depths",
    selector: "#tangled-depths + .grid > div",
    group: "Heart of Thorns",
    hasWaypoint: true,
  },
  {
    name: "Dragon’s Stand",
    selector: "#dragons-stand + .grid > div",
    group: "Heart of Thorns",
    hasWaypoint: true,
  },
  {
    name: "Lake Doric",
    selector: "#lake-doric + .grid > div",
    group: "Living World Season 3",
    hasWaypoint: true,
  },
  {
    name: "Crystal Oasis",
    selector: "#crystal-oasis + .grid > div",
    group: "Path of Fire",
    hasWaypoint: true,
  },
  {
    name: "Desert Highlands",
    selector: "#desert-highlands + .grid > div",
    group: "Path of Fire",
    hasWaypoint: true,
  },
  {
    name: "Elon Riverlands",
    selector: "#elon-riverlands + .grid > div",
    group: "Path of Fire",
    hasWaypoint: true,
  },
  {
    name: "The Desolation",
    selector: "#the-desolation + .grid > div",
    group: "Path of Fire",
    hasWaypoint: true,
  },
  {
    name: "Domain of Vabbi",
    selector: "#domain-of-vabbi + .grid > div",
    group: "Path of Fire",
    hasWaypoint: true,
  },
  {
    name: "Awakened Invasion",
    selector: "#awakened-invasion + .grid > div",
    group: "Living World Season 4",
    hasWaypoint: true,
  },
  {
    name: "Domain of Istan",
    selector: "#domain-of-istan + .grid > div",
    group: "Living World Season 4",
    hasWaypoint: true,
  },
  {
    name: "Jahai Bluffs",
    selector: "#jahai-bluffs + .grid > div",
    group: "Living World Season 4",
    hasWaypoint: true,
  },
  {
    name: "Thunderhead Peaks",
    selector: "#thunderhead-peaks + .grid > div",
    group: "Living World Season 4",
    hasWaypoint: true,
  },
  {
    name: "Grothmar Valley",
    selector: "#grothmar-valley + .grid > div",
    group: "The Icebrood Saga",
    hasWaypoint: true,
  },
  {
    name: "Bjora Marches",
    selector: "#bjora-marches + .grid > div",
    group: "The Icebrood Saga",
    hasWaypoint: true,
  },
  {
    name: "Dragonstorm",
    selector: "#dragonstorm + .grid > div",
    group: "The Icebrood Saga",
    hasWaypoint: true,
  },
  {
    name: "Seitung Province",
    selector: "#seitung-province + .grid > div",
    group: "End of Dragons",
    hasWaypoint: true,
  },
  {
    name: "New Kaineng City",
    selector: "#new-kaineng-city + .grid > div",
    group: "End of Dragons",
    hasWaypoint: true,
  },
  {
    name: "The Echovald Wilds",
    selector: "#the-echovald-wilds + .grid > div",
    group: "End of Dragons",
    hasWaypoint: true,
  },
  {
    name: "Dragon's End",
    selector: "#dragons-end + .grid > div",
    group: "End of Dragons",
    hasWaypoint: true,
  },
  {
    name: "Skywatch Archipelago",
    selector: "#skywatch-archipelago + .grid > div",
    group: "Secrets of the Obscure",
    hasWaypoint: true,
  },
  {
    name: "Wizard's Tower",
    selector: "#wizards-tower + .grid > div",
    group: "Secrets of the Obscure",
    hasWaypoint: true,
  },
  {
    name: "Amnytas",
    selector: "#amnytas + .grid > div",
    group: "Secrets of the Obscure",
    hasWaypoint: true,
  },
  {
    name: "Conv.: Outer Nayos",
    selector: "#conv-outer-navos + .grid > div",
    group: "Secrets of the Obscure",
    hasWaypoint: true,
  },
  {
    name: "Janthir Syntri",
    selector: "#janthir-syntri + .grid > div",
    group: "Janthir Wilds",
    hasWaypoint: true,
  },
  {
    name: "Bava Nisos",
    selector: "#bava-nisos + .grid > div",
    group: "Janthir Wilds",
    hasWaypoint: true,
  },
  {
    name: "Conv.: Mount Balrior",
    selector: "#conv-mount-balrior + .grid > div",
    group: "Janthir Wilds",
    hasWaypoint: true,
  },
  {
    name: "Shipwreck Strand",
    selector: "#shipwreck-strand + .grid > div",
    group: "Visions of Eternity",
    hasWaypoint: true,
  },
  {
    name: "Starlit Weald",
    selector: "#starlit-weald + .grid > div",
    group: "Visions of Eternity",
    hasWaypoint: true,
  },
  {
    name: "Labyrinthine Cliffs",
    selector: "#labyrinthine-cliffs + .grid > div",
    group: "Special Events",
    hasWaypoint: true,
  },
  {
    name: "Dragon Bash",
    selector: "#dragon-bash + .grid > div",
    group: "Special Events",
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

    const allEventsOutput = Object.entries(events).map(([group, sections]) => {
      const sectionLines = sections
        .map((s) => `**${s.name}**\n${s.output}`)
        .join("\n");
      return `**===${group}===**\n${sectionLines}`;
    });

    allEventsOutput.forEach((output) => {
      msg.channel.send(output);
    });
  }
});

client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(TOKEN);
