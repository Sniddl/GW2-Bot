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
    command: "!bosses",
  },
  {
    name: "Hard World Bosses",
    selector: "#hard-world-bosses + .grid > div",
    group: "Core Tyria",
    hasWaypoint: true,
    command: "!bosses",
  },
  {
    name: "Ley-Line Anomaly",
    selector: "#ley-line-anomaly + .grid > div",
    group: "Core Tyria",
    hasWaypoint: true,
    command: "!events",
  },
  {
    name: "Fractal Incursions",
    selector: "#fractal-incursions + .grid > div",
    group: "Core Tyria",
    hasWaypoint: true,
    command: "!events",
  },
  {
    name: "EU PVP Tournaments",
    selector: "#eu-pvp-tournaments + .grid > div",
    group: "Core Tyria",
    hasWaypoint: false,
    command: "!events",
  },
  {
    name: "NA PVP Tournaments",
    selector: "#na-pvp-tournaments + .grid > div",
    group: "Core Tyria",
    hasWaypoint: false,
    command: "!events",
  },
  {
    name: "Eye of the North",
    selector: "#eye-of-the-north + .grid > div",
    group: "Living World Season 1",
    hasWaypoint: true,
    command: "!lw",
  },
  {
    name: "Scarlets Invasion",
    selector: "#scarlets-invasion + .grid > div",
    group: "Living World Season 1",
    hasWaypoint: true,
    command: "!lw",
  },
  {
    name: "Dry Top",
    selector: "#dry-top + .grid > div",
    group: "Living World Season 2",
    hasWaypoint: true,
    command: "!lw",
  },
  {
    name: "Verdant Brink",
    selector: "#verdant-brink + .grid > div",
    group: "Heart of Thorns",
    hasWaypoint: true,
    command: "!hot",
  },
  {
    name: "Auric Basin",
    selector: "#auric-basin + .grid > div",
    group: "Heart of Thorns",
    hasWaypoint: true,
    command: "!hot",
  },
  {
    name: "Tangled Depths",
    selector: "#tangled-depths + .grid > div",
    group: "Heart of Thorns",
    hasWaypoint: true,
    command: "!hot",
  },
  {
    name: "Dragon’s Stand",
    selector: "#dragons-stand + .grid > div",
    group: "Heart of Thorns",
    hasWaypoint: true,
    command: "!hot",
  },
  {
    name: "Lake Doric",
    selector: "#lake-doric + .grid > div",
    group: "Living World Season 3",
    hasWaypoint: true,
    command: "!lw",
  },
  {
    name: "Crystal Oasis",
    selector: "#crystal-oasis + .grid > div",
    group: "Path of Fire",
    hasWaypoint: true,
    command: "!pof",
  },
  {
    name: "Desert Highlands",
    selector: "#desert-highlands + .grid > div",
    group: "Path of Fire",
    hasWaypoint: true,
    command: "!pof",
  },
  {
    name: "Elon Riverlands",
    selector: "#elon-riverlands + .grid > div",
    group: "Path of Fire",
    hasWaypoint: true,
    command: "!pof",
  },
  {
    name: "The Desolation",
    selector: "#the-desolation + .grid > div",
    group: "Path of Fire",
    hasWaypoint: true,
    command: "!pof",
  },
  {
    name: "Domain of Vabbi",
    selector: "#domain-of-vabbi + .grid > div",
    group: "Path of Fire",
    hasWaypoint: true,
    command: "!pof",
  },
  {
    name: "Awakened Invasion",
    selector: "#awakened-invasion + .grid > div",
    group: "Living World Season 4",
    hasWaypoint: true,
    command: "!lw",
  },
  {
    name: "Domain of Istan",
    selector: "#domain-of-istan + .grid > div",
    group: "Living World Season 4",
    hasWaypoint: true,
    command: "!lw",
  },
  {
    name: "Jahai Bluffs",
    selector: "#jahai-bluffs + .grid > div",
    group: "Living World Season 4",
    hasWaypoint: true,
    command: "!lw",
  },
  {
    name: "Thunderhead Peaks",
    selector: "#thunderhead-peaks + .grid > div",
    group: "Living World Season 4",
    hasWaypoint: true,
    command: "!lw",
  },
  {
    name: "Grothmar Valley",
    selector: "#grothmar-valley + .grid > div",
    group: "The Icebrood Saga",
    hasWaypoint: true,
    command: "!ibs",
  },
  {
    name: "Bjora Marches",
    selector: "#bjora-marches + .grid > div",
    group: "The Icebrood Saga",
    hasWaypoint: true,
    command: "!ibs",
  },
  {
    name: "Dragonstorm",
    selector: "#dragonstorm + .grid > div",
    group: "The Icebrood Saga",
    hasWaypoint: true,
    command: "!ibs",
  },
  {
    name: "Seitung Province",
    selector: "#seitung-province + .grid > div",
    group: "End of Dragons",
    hasWaypoint: true,
    command: "!eod",
  },
  {
    name: "New Kaineng City",
    selector: "#new-kaineng-city + .grid > div",
    group: "End of Dragons",
    hasWaypoint: true,
    command: "!eod",
  },
  {
    name: "The Echovald Wilds",
    selector: "#the-echovald-wilds + .grid > div",
    group: "End of Dragons",
    hasWaypoint: true,
    command: "!eod",
  },
  {
    name: "Dragon's End",
    selector: "#dragons-end + .grid > div",
    group: "End of Dragons",
    hasWaypoint: true,
    command: "!eod",
  },
  {
    name: "Skywatch Archipelago",
    selector: "#skywatch-archipelago + .grid > div",
    group: "Secrets of the Obscure",
    hasWaypoint: true,
    command: "!soto",
  },
  {
    name: "Wizard's Tower",
    selector: "#wizards-tower + .grid > div",
    group: "Secrets of the Obscure",
    hasWaypoint: true,
    command: "!soto",
  },
  {
    name: "Amnytas",
    selector: "#amnytas + .grid > div",
    group: "Secrets of the Obscure",
    hasWaypoint: true,
    command: "!soto",
  },
  {
    name: "Conv.: Outer Nayos",
    selector: "#conv-outer-navos + .grid > div",
    group: "Secrets of the Obscure",
    hasWaypoint: true,
    command: "!soto",
  },
  {
    name: "Janthir Syntri",
    selector: "#janthir-syntri + .grid > div",
    group: "Janthir Wilds",
    hasWaypoint: true,
    command: "!jw",
  },
  {
    name: "Bava Nisos",
    selector: "#bava-nisos + .grid > div",
    group: "Janthir Wilds",
    hasWaypoint: true,
    command: "!jw",
  },
  {
    name: "Conv.: Mount Balrior",
    selector: "#conv-mount-balrior + .grid > div",
    group: "Janthir Wilds",
    hasWaypoint: true,
    command: "!jw",
  },
  {
    name: "Shipwreck Strand",
    selector: "#shipwreck-strand + .grid > div",
    group: "Visions of Eternity",
    hasWaypoint: true,
    command: "!voe",
  },
  {
    name: "Starlit Weald",
    selector: "#starlit-weald + .grid > div",
    group: "Visions of Eternity",
    hasWaypoint: true,
    command: "!voe",
  },
  {
    name: "Labyrinthine Cliffs",
    selector: "#labyrinthine-cliffs + .grid > div",
    group: "Special Events",
    hasWaypoint: true,
    command: "!events",
  },
  {
    name: "Dragon Bash",
    selector: "#dragon-bash + .grid > div",
    group: "Special Events",
    hasWaypoint: true,
    command: "!events",
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
              return `${boss} at [${waypoint}] ${humanTime}`;
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

    return parsedSections;
  } catch (err) {
    console.error("Error scraping GW2 Ninja:", err);
    return ["⚠️ Error fetching GW2 bosses."];
  } finally {
    if (browser) await browser.close();
  }
}

client.on("messageCreate", async (msg) => {
  if (msg.content.trim().toLowerCase() === "!help") {
    await msg.channel.send(`
\`!bosses\` Boss events
\`!lw\` Living world events
\`!hot\` Heart of Thorns events
\`!pof\` Path of Fire events
\`!ibs\` The Icebrood Saga events
\`!eod\` End of Dragons events
\`!soto\` Secrets of the Obscure events
\`!jw\` Janthir Wilds events
\`!voe\` Visions of Eternity events
\`!events\` Uncategorized events
      `);
  }
  if (msg.content.trim().toLowerCase() === "!bosses") {
    await msg.channel.send("Fetching next world bosses. Please wait ⏳");
    const events = await getAllEvents();
    const eventsOutput = events
      .filter((x) => x.command === "!bosses")
      .map((x) => `**${x.name}**\n${x.output}`)
      .join("\n");
    msg.channel.send(eventsOutput);
  }

  if (msg.content.trim().toLowerCase() === "!lw") {
    await msg.channel.send("Fetching next Living World events. Please wait ⏳");
    const events = await getAllEvents();
    const eventsOutput = Object.entries(
      events
        .filter((x) => x.command === "!lw")
        .reduce((acc, x) => {
          acc[x.group] ||= [];
          acc[x.group].push(x);
          return acc;
        }, {}),
    )
      .map(([group, sections]) => {
        const lines = sections
          .map((s) => `**${s.name}**:\n ${s.output}`)
          .join("\n");
        return `**===${group}===**\n${lines}`;
      })
      .join("\n");
    msg.channel.send(eventsOutput);
  }

  if (msg.content.trim().toLowerCase() === "!hot") {
    await msg.channel.send(
      "Fetching next Heart of Thorns events. Please wait ⏳",
    );
    const events = await getAllEvents();
    const eventsOutput = Object.entries(
      events
        .filter((x) => x.command === "!hot")
        .reduce((acc, x) => {
          acc[x.group] ||= [];
          acc[x.group].push(x);
          return acc;
        }, {}),
    )
      .map(([group, sections]) => {
        const lines = sections
          .map((s) => `**${s.name}**:\n ${s.output}`)
          .join("\n");
        return `**===${group}===**\n${lines}`;
      })
      .join("\n");
    msg.channel.send(eventsOutput);
  }

  if (msg.content.trim().toLowerCase() === "!pof") {
    await msg.channel.send("Fetching next Path of Fire events. Please wait ⏳");
    const events = await getAllEvents();
    const eventsOutput = Object.entries(
      events
        .filter((x) => x.command === "!pof")
        .reduce((acc, x) => {
          acc[x.group] ||= [];
          acc[x.group].push(x);
          return acc;
        }, {}),
    )
      .map(([group, sections]) => {
        const lines = sections
          .map((s) => `**${s.name}**:\n ${s.output}`)
          .join("\n");
        return `**===${group}===**\n${lines}`;
      })
      .join("\n");
    msg.channel.send(eventsOutput);
  }

  if (msg.content.trim().toLowerCase() === "!ibs") {
    await msg.channel.send(
      "Fetching next The Icebrood Saga events. Please wait ⏳",
    );
    const events = await getAllEvents();
    const eventsOutput = Object.entries(
      events
        .filter((x) => x.command === "!ibs")
        .reduce((acc, x) => {
          acc[x.group] ||= [];
          acc[x.group].push(x);
          return acc;
        }, {}),
    )
      .map(([group, sections]) => {
        const lines = sections
          .map((s) => `**${s.name}**:\n ${s.output}`)
          .join("\n");
        return `**===${group}===**\n${lines}`;
      })
      .join("\n");
    msg.channel.send(eventsOutput);
  }

  if (msg.content.trim().toLowerCase() === "!eod") {
    await msg.channel.send(
      "Fetching next End of Dragons events. Please wait ⏳",
    );
    const events = await getAllEvents();
    const eventsOutput = Object.entries(
      events
        .filter((x) => x.command === "!eod")
        .reduce((acc, x) => {
          acc[x.group] ||= [];
          acc[x.group].push(x);
          return acc;
        }, {}),
    )
      .map(([group, sections]) => {
        const lines = sections
          .map((s) => `**${s.name}**:\n ${s.output}`)
          .join("\n");
        return `**===${group}===**\n${lines}`;
      })
      .join("\n");
    msg.channel.send(eventsOutput);
  }

  if (msg.content.trim().toLowerCase() === "!soto") {
    await msg.channel.send(
      "Fetching next Secrets of the Obscure events. Please wait ⏳",
    );
    const events = await getAllEvents();
    const eventsOutput = Object.entries(
      events
        .filter((x) => x.command === "!soto")
        .reduce((acc, x) => {
          acc[x.group] ||= [];
          acc[x.group].push(x);
          return acc;
        }, {}),
    )
      .map(([group, sections]) => {
        const lines = sections
          .map((s) => `**${s.name}**:\n ${s.output}`)
          .join("\n");
        return `**===${group}===**\n${lines}`;
      })
      .join("\n");
    msg.channel.send(eventsOutput);
  }

  if (msg.content.trim().toLowerCase() === "!jw") {
    await msg.channel.send(
      "Fetching next Janthir Wilds events. Please wait ⏳",
    );
    const events = await getAllEvents();
    const eventsOutput = Object.entries(
      events
        .filter((x) => x.command === "!jw")
        .reduce((acc, x) => {
          acc[x.group] ||= [];
          acc[x.group].push(x);
          return acc;
        }, {}),
    )
      .map(([group, sections]) => {
        const lines = sections
          .map((s) => `**${s.name}**:\n ${s.output}`)
          .join("\n");
        return `**===${group}===**\n${lines}`;
      })
      .join("\n");
    msg.channel.send(eventsOutput);
  }

  if (msg.content.trim().toLowerCase() === "!voe") {
    await msg.channel.send(
      "Fetching next Visions of Eternity events. Please wait ⏳",
    );
    const events = await getAllEvents();
    const eventsOutput = Object.entries(
      events
        .filter((x) => x.command === "!voe")
        .reduce((acc, x) => {
          acc[x.group] ||= [];
          acc[x.group].push(x);
          return acc;
        }, {}),
    )
      .map(([group, sections]) => {
        const lines = sections
          .map((s) => `**${s.name}**:\n ${s.output}`)
          .join("\n");
        return `**===${group}===**\n${lines}`;
      })
      .join("\n");
    msg.channel.send(eventsOutput);
  }

  if (msg.content.trim().toLowerCase() === "!events") {
    await msg.channel.send("Fetching all events. Please wait ⏳");
    const events = await getAllEvents();
    const eventsOutput = Object.entries(
      events
        .filter((x) => x.command === "!events")
        .reduce((acc, x) => {
          acc[x.group] ||= [];
          acc[x.group].push(x);
          return acc;
        }, {}),
    )
      .map(([group, sections]) => {
        const lines = sections
          .map((s) => `**${s.name}**:\n ${s.output}`)
          .join("\n");
        return `**===${group}===**\n${lines}`;
      })
      .join("\n");
    msg.channel.send(eventsOutput);
  }
});

client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(TOKEN);
