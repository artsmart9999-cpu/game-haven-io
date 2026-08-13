export type Game = {
  slug: string;
  title: string;
  /** GameDistribution HTML5 embed URL — paste yours here */
  embedUrl: string;
  category: string;
  tags: string[];
  description: string;
  controls: string[];
  featured?: boolean;
  hue: number;
  plays: string;
  rating: number;
};

export const categories = [
  { slug: "action", name: "Action", icon: "Swords" },
  { slug: "shooting", name: "Shooting", icon: "Crosshair" },
  { slug: "racing", name: "Racing", icon: "Car" },
  { slug: "puzzle", name: "Puzzle", icon: "Puzzle" },
  { slug: "sports", name: "Sports", icon: "Trophy" },
  { slug: "io", name: ".io", icon: "Globe" },
  { slug: "adventure", name: "Adventure", icon: "Map" },
  { slug: "casual", name: "Casual", icon: "Gamepad2" },
  { slug: "2-player", name: "2 Player", icon: "Users" },
  { slug: "clicker", name: "Clicker", icon: "MousePointerClick" },
] as const;

/**
 * Replace `embedUrl` with the HTML5 link you get from gamedistribution.com,
 * e.g. https://html5.gamedistribution.com/<GAME_ID>/
 */
export const games: Game[] = [
  {
    slug: "neon-drift-arena",
    title: "Neon Drift Arena",
    embedUrl: "https://html5.gamedistribution.com/0e2c1b0a9b0d4a6cbb1a1e2f3a4b5c6d/",
    category: "racing",
    tags: ["drift", "cars", "3d", "arcade"],
    description:
      "Slide through neon-lit circuits, chain perfect drifts and out-run rivals in fast arcade races.",
    controls: ["W / Up — accelerate", "S / Down — brake", "A / D — steer", "Space — handbrake drift"],
    featured: true,
    hue: 27,
    plays: "4.2M",
    rating: 92,
  },
  {
    slug: "shadow-blade-runner",
    title: "Shadow Blade Runner",
    embedUrl: "https://html5.gamedistribution.com/1f3d2c4b5a6e7d8c9b0a1f2e3d4c5b6a/",
    category: "action",
    tags: ["ninja", "platformer", "combat"],
    description: "A ninja platformer full of precise jumps, wall runs and blade combos.",
    controls: ["A / D — move", "Space — jump", "Mouse Left — attack", "Shift — dash"],
    hue: 300,
    plays: "2.8M",
    rating: 89,
  },
  {
    slug: "sniper-tower-siege",
    title: "Sniper Tower Siege",
    embedUrl: "https://html5.gamedistribution.com/2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d/",
    category: "shooting",
    tags: ["sniper", "fps", "aim"],
    description: "Hold the tower, line up impossible shots and clear every wave of attackers.",
    controls: ["Mouse — aim", "Mouse Left — fire", "R — reload", "Shift — hold breath"],
    hue: 195,
    plays: "6.1M",
    rating: 94,
  },
  {
    slug: "block-crush-saga",
    title: "Block Crush Saga",
    embedUrl: "https://html5.gamedistribution.com/3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e/",
    category: "puzzle",
    tags: ["match3", "brain", "relax"],
    description: "Match colourful blocks, trigger huge combos and beat 200 handcrafted levels.",
    controls: ["Mouse Left — select block", "Drag — swap tiles"],
    hue: 145,
    plays: "9.4M",
    rating: 96,
  },
  {
    slug: "street-hoops-3v3",
    title: "Street Hoops 3v3",
    embedUrl: "https://html5.gamedistribution.com/4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f/",
    category: "sports",
    tags: ["basketball", "2 player", "arcade"],
    description: "Fast 3v3 street basketball with dunks, trick shots and local multiplayer.",
    controls: ["WASD — player 1", "Arrows — player 2", "Space / Enter — shoot"],
    hue: 45,
    plays: "1.9M",
    rating: 87,
  },
  {
    slug: "hexa-snake-io",
    title: "Hexa Snake.io",
    embedUrl: "https://html5.gamedistribution.com/5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a/",
    category: "io",
    tags: ["io", "multiplayer", "snake"],
    description: "Grow the longest snake on the server and trap other players in your trail.",
    controls: ["Mouse — steer", "Mouse Left — boost"],
    featured: true,
    hue: 165,
    plays: "12.3M",
    rating: 91,
  },
  {
    slug: "temple-escape-quest",
    title: "Temple Escape Quest",
    embedUrl: "https://html5.gamedistribution.com/6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b/",
    category: "adventure",
    tags: ["runner", "3d", "escape"],
    description: "Outrun the collapsing temple, dodge traps and collect ancient relics.",
    controls: ["A / D — switch lane", "W — jump", "S — slide"],
    hue: 85,
    plays: "3.6M",
    rating: 88,
  },
  {
    slug: "bubble-cat-pop",
    title: "Bubble Cat Pop",
    embedUrl: "https://html5.gamedistribution.com/7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c/",
    category: "casual",
    tags: ["bubble", "cute", "family"],
    description: "Pop bubbles, rescue kittens and relax through a hundred cosy stages.",
    controls: ["Mouse — aim", "Mouse Left — shoot bubble"],
    hue: 330,
    plays: "5.5M",
    rating: 90,
  },
  {
    slug: "tank-duel-arena",
    title: "Tank Duel Arena",
    embedUrl: "https://html5.gamedistribution.com/8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d/",
    category: "2-player",
    tags: ["tanks", "2 player", "battle"],
    description: "Split-screen tank battles with destructible walls and ricochet shots.",
    controls: ["WASD — tank 1", "Arrows — tank 2", "Space / Enter — fire"],
    hue: 20,
    plays: "2.2M",
    rating: 85,
  },
  {
    slug: "idle-mine-empire",
    title: "Idle Mine Empire",
    embedUrl: "https://html5.gamedistribution.com/9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e/",
    category: "clicker",
    tags: ["idle", "clicker", "upgrade"],
    description: "Click, hire miners and automate a whole underground empire.",
    controls: ["Mouse Left — mine", "Mouse — buy upgrades"],
    hue: 250,
    plays: "7.8M",
    rating: 93,
  },
  {
    slug: "zombie-city-defense",
    title: "Zombie City Defense",
    embedUrl: "https://html5.gamedistribution.com/0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f/",
    category: "action",
    tags: ["zombie", "defense", "survival"],
    description: "Barricade the streets, upgrade turrets and survive thirty nights of undead.",
    controls: ["WASD — move", "Mouse Left — shoot", "1-4 — build turret"],
    hue: 120,
    plays: "4.9M",
    rating: 90,
  },
  {
    slug: "moto-stunt-x",
    title: "Moto Stunt X",
    embedUrl: "https://html5.gamedistribution.com/1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a/",
    category: "racing",
    tags: ["bike", "stunts", "physics"],
    description: "Physics-driven bike stunts across ramps, loops and impossible rooftops.",
    controls: ["W — throttle", "S — brake", "A / D — lean", "R — restart"],
    hue: 60,
    plays: "3.1M",
    rating: 86,
  },
];

export const featuredGame = games.find((g) => g.featured)!;

export function gameBySlug(slug: string) {
  return games.find((g) => g.slug === slug);
}

export function tileStyle(hue: number) {
  return {
    backgroundImage: `linear-gradient(135deg, oklch(0.62 0.19 ${hue}), oklch(0.4 0.12 ${(hue + 60) % 360}))`,
  };
}
