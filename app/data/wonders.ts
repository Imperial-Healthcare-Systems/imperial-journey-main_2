export type WonderLayout = "feature" | "wide" | "tall" | "";

export type Wonder = {
  id: string;
  layout: WonderLayout;
  label: string;
  title: string;
  image: string;
  heroVideo: string;
  tagline: string;
  intro: string;
  body: string;
  days: string;
  season: string;
  from: string;
  style: string;
  gallery: { img: string; cap: string }[];
};

export const WONDERS: Wonder[] = [
  {
    id: "waterfalls",
    layout: "feature",
    label: "Iceland · Costa Rica",
    title: "Waterfalls of the Wild",
    image:
      "https://images.pexels.com/photos/210186/pexels-photo-210186.jpeg?auto=compress&cs=tinysrgb&w=1600",
    heroVideo:
      "https://videos.pexels.com/video-files/1448735/1448735-hd_1920_1080_24fps.mp4",
    tagline: "Helicopter to remote cascades few travellers ever see.",
    intro:
      "Some waterfalls you walk to. The ones we send you to, you fly into. Iceland's glacial monsters and Costa Rica's jungle veils — both with private guides, both with picnics on the kind of moss only photographers know about.",
    body: "This is a journey for travellers who have already seen the famous ones. We will route you to Háifoss in the highlands at golden hour, then to a Costa Rican cataract reachable only by 4×4 and a one-mile jungle trail. Your nights are at the architectural Deplar Farm in north Iceland, and a treehouse-villa near Manuel Antonio.",
    days: "11 Days",
    season: "May — September",
    from: "₹6,95,000 / $8,400 per guest",
    style: "Adventure · Luxury",
    gallery: [
      { img: "https://images.pexels.com/photos/2406836/pexels-photo-2406836.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Helicopter approach" },
      { img: "https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Glacier picnic" },
      { img: "https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Jungle trail" },
    ],
  },
  {
    id: "savanna",
    layout: "tall",
    label: "Tanzania",
    title: "Serengeti at Sunset",
    image:
      "https://images.pexels.com/photos/259411/pexels-photo-259411.jpeg?auto=compress&cs=tinysrgb&w=1200",
    heroVideo:
      "https://videos.pexels.com/video-files/2249402/2249402-uhd_3840_2160_30fps.mp4",
    tagline:
      "Luxury tented camps. Naturalist drives. Hot-air balloons over the migration.",
    intro:
      "The Serengeti is a noun and a verb. We will teach you the difference. Your nine days move with the great migration — Singita Sasakwa for the south, Sayari for the Mara River crossings.",
    body: "A naturalist guide stays with you the entire trip. Mornings begin at 5:30 a.m. with coffee delivered to your tent before the first drive; afternoons are siestas under acacia, evenings are sundowners on the deck before a kitchen-garden dinner. One morning is reserved for a hot-air balloon over the herds at sunrise.",
    days: "9 Days",
    season: "June — October",
    from: "₹10,50,000 / $12,800 per guest",
    style: "Wildlife · Luxury",
    gallery: [
      { img: "https://images.pexels.com/photos/162306/lion-zoo-lion-king-animal-world-162306.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "King at dawn" },
      { img: "https://images.pexels.com/photos/247431/pexels-photo-247431.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Tented suite" },
      { img: "https://images.pexels.com/photos/4577392/pexels-photo-4577392.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Balloon at sunrise" },
    ],
  },
  {
    id: "amazon",
    layout: "",
    label: "Brazil · Peru",
    title: "The Amazon, Slowly",
    image:
      "https://images.pexels.com/photos/1320684/pexels-photo-1320684.jpeg?auto=compress&cs=tinysrgb&w=1200",
    heroVideo:
      "https://videos.pexels.com/video-files/3214448/3214448-uhd_3840_2160_25fps.mp4",
    tagline: "River boats, jungle canopies, and silences that change you.",
    intro:
      "Two weeks aboard the Aria Amazon, a 16-suite river yacht. Skiff trips at dawn, naturalist talks at dusk. The Amazon is the kind of trip you do not describe afterward — you just become a slightly different person.",
    body: "You will cross the meeting of waters, walk canopy bridges 40 metres above the rainforest floor, and fish for piranhas with Indigenous guides. The boat's chef trained in São Paulo and the wine list reaches Mendoza. Every cabin has floor-to-ceiling river-facing windows.",
    days: "12 Days",
    season: "May — November / December — April",
    from: "₹7,90,000 / $9,600 per guest",
    style: "Expedition · Boutique",
    gallery: [
      { img: "https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "River bend" },
      { img: "https://images.pexels.com/photos/1133505/pexels-photo-1133505.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Canopy walk" },
      { img: "https://images.pexels.com/photos/3061217/pexels-photo-3061217.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "River yacht" },
    ],
  },
  {
    id: "sevenstar",
    layout: "wide",
    label: "Dubai · Maldives · Bali",
    title: "Seven-Star Suites",
    image:
      "https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg?auto=compress&cs=tinysrgb&w=1600",
    heroVideo:
      "https://videos.pexels.com/video-files/4205697/4205697-uhd_3840_2160_25fps.mp4",
    tagline:
      "Iconic landmark hotels, butler-served residences, only the rooms we would stay in ourselves.",
    intro:
      "Three weeks across three icons. The most iconic stay in Dubai for the spectacle, an overwater villa in the Maldives for the silence, a riverside Ubud retreat for the green. Each stay handpicked by us, each transfer (private jet between Dubai and Malé, seaplane onward) handled before you land.",
    body: "In Dubai you'll have a duplex Royal Suite with a private cinema and a 24-hour butler. In the Maldives, an overwater pavilion at Soneva Jani with a slide into the lagoon and an in-villa chef who learns your tastes by night two. In Bali, a private river-facing villa with daily yoga and a rotating roster of Balinese healers.",
    days: "21 Days",
    season: "Year-round",
    from: "₹3,95,000 / $4,800 per guest",
    style: "Ultra-Luxury · Resort",
    gallery: [
      { img: "https://images.pexels.com/photos/261101/pexels-photo-261101.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Suite balcony" },
      { img: "https://images.pexels.com/photos/2549018/pexels-photo-2549018.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Overwater villa" },
      { img: "https://images.pexels.com/photos/2417842/pexels-photo-2417842.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Bali river villa" },
    ],
  },
  {
    id: "gourmet",
    layout: "",
    label: "Gourmet",
    title: "Tables of Fire",
    image:
      "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=1200",
    heroVideo:
      "https://videos.pexels.com/video-files/3196219/3196219-uhd_3840_2160_25fps.mp4",
    tagline: "A culinary tour curated by a chef, not a concierge.",
    intro:
      "Ten days, four cities, every dinner with the chef in the kitchen. From a robatayaki master in Kyoto to a Basque asador in San Sebastián, you will eat where the chefs eat on their nights off.",
    body: "Daytime is markets, vineyards, distilleries — you will meet a salt farmer in the Algarve, an aged-beef expert in Mendoza, a fifth-generation kombu harvester in Hokkaido. Every meal is intimate (max eight guests), and you can request a private cooking lesson at any city. Two of the dinners are at restaurants currently closed to the public.",
    days: "10 Days",
    season: "Year-round (best Sept — Nov)",
    from: "₹11,75,000 / $14,200 per guest",
    style: "Culinary · Boutique",
    gallery: [
      { img: "https://images.pexels.com/photos/1854652/pexels-photo-1854652.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Open kitchen" },
      { img: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Market visit" },
      { img: "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Tasting flight" },
    ],
  },
  {
    id: "desert",
    layout: "",
    label: "Sahara · Rajasthan",
    title: "Camel & Dunes",
    image:
      "https://images.pexels.com/photos/3889855/pexels-photo-3889855.jpeg?auto=compress&cs=tinysrgb&w=1200",
    heroVideo:
      "https://videos.pexels.com/video-files/8397876/8397876-uhd_2560_1440_25fps.mp4",
    tagline:
      "A camel walk across the dunes, a Bedouin camp under more stars than you have ever seen.",
    intro:
      "Eight days that begin with palace stays in Jaipur and Jaisalmer, then move you slowly into the Thar — by camel, on foot, and finally to a private luxury camp pitched between the dunes for three nights of stargazing, oud music, and astonishingly good kitchen-tent cooking.",
    body: "Or, the Sahara version: from Marrakech's riads through the Atlas to Erg Chigaga, the Sahara's most remote dune sea. Either route, your last night is on the dunes themselves — bedrolls, bonfires, and a sky you will think about in city traffic for years.",
    days: "8 Days",
    season: "October — March",
    from: "₹2,45,000 / $2,950 per guest",
    style: "Cultural · Adventure",
    gallery: [
      { img: "https://images.pexels.com/photos/848612/pexels-photo-848612.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Dune crest" },
      { img: "https://images.pexels.com/photos/2832077/pexels-photo-2832077.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Caravan" },
      { img: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Tent at night" },
    ],
  },
  {
    id: "kashmir",
    layout: "tall",
    label: "Kashmir",
    title: "Snowfall in the Valley",
    image:
      "https://images.pexels.com/photos/2440024/pexels-photo-2440024.jpeg?auto=compress&cs=tinysrgb&w=1200",
    heroVideo:
      "https://videos.pexels.com/video-files/2786062/2786062-uhd_3840_2160_30fps.mp4",
    tagline:
      "Heritage houseboats on Dal Lake. Wood-fire stoves. The Himalayas at your window.",
    intro:
      "Seven nights split between a heritage houseboat moored on Dal Lake and a private wooden cottage above Gulmarg. Snowfall most days. A private chef on the houseboat, a local guide who has been skiing Gulmarg since 1998 in the mountains.",
    body: "You will wake to mist on the lake, take a shikara across glassy water for breakfast at a hidden Mughal garden, then drive up to Gulmarg for a day on the gondola — the highest in the world. Skiers can opt for a heli-ski day across the Apharwat range. Every evening ends with kahwa by the fire.",
    days: "8 Days",
    season: "December — March",
    from: "₹1,85,000 / $2,250 per guest",
    style: "Mountain · Heritage",
    gallery: [
      { img: "https://images.pexels.com/photos/1004665/pexels-photo-1004665.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Houseboat at dawn" },
      { img: "https://images.pexels.com/photos/848373/pexels-photo-848373.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Snow-covered pines" },
      { img: "https://images.pexels.com/photos/3373306/pexels-photo-3373306.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Gondola view" },
    ],
  },
  {
    id: "bonfire",
    layout: "",
    label: "Wilderness",
    title: "Bonfires & Stars",
    image:
      "https://images.pexels.com/photos/1368382/pexels-photo-1368382.jpeg?auto=compress&cs=tinysrgb&w=1200",
    heroVideo:
      "https://videos.pexels.com/video-files/4115076/4115076-uhd_2732_1440_25fps.mp4",
    tagline: "A starlit weekend nobody can interrupt.",
    intro:
      "Three nights at a remote luxury wilderness camp — Spiti, the Aravallis, or a private property in Madhya Pradesh. No phone signal. A private chef, a guide who knows the night sky, and your own astronomer-led stargazing session on night two.",
    body: "This is the journey we recommend to founders, parents, and anyone who has not been properly bored in three years. Days are slow: walks, naps, cold-water plunges, books. Evenings are bonfires, slow dinners, and a sky that genuinely feels three-dimensional. Couples and small families only.",
    days: "4 Days",
    season: "October — March",
    from: "₹95,000 / $1,150 per guest",
    style: "Wellness · Wilderness",
    gallery: [
      { img: "https://images.pexels.com/photos/2403568/pexels-photo-2403568.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Camp at dusk" },
      { img: "https://images.pexels.com/photos/957024/forest-trees-perspective-bright-957024.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Morning trail" },
      { img: "https://images.pexels.com/photos/1933316/pexels-photo-1933316.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Stars above" },
    ],
  },
  {
    id: "rafting",
    layout: "",
    label: "Rishikesh · Colorado",
    title: "White-water Days",
    image:
      "https://images.pexels.com/photos/1497582/pexels-photo-1497582.jpeg?auto=compress&cs=tinysrgb&w=1200",
    heroVideo:
      "https://videos.pexels.com/video-files/3214450/3214450-uhd_3840_2160_25fps.mp4",
    tagline: "Class IV rapids by day, riverside camps by night.",
    intro:
      "A six-day adventure for travellers who think a holiday should leave a few bruises. Rishikesh-to-Shivpuri on the Ganges, with two ex-army-captain river guides and a kitchen-team that materialises a multi-course dinner at every campsite.",
    body: "You will run the Roller-Coaster, the Wall, and the Three Blind Mice — the last is a Class IV that will become your favourite story. Nights are at riverside tented camps, days alternate between rafting and cliff-jumping. We can extend with a five-day yoga retreat in Rishikesh after for guests who want the full arc.",
    days: "6 Days",
    season: "September — November, March — May",
    from: "₹65,000 / $785 per guest",
    style: "Adventure · Active",
    gallery: [
      { img: "https://images.pexels.com/photos/2823175/pexels-photo-2823175.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Class IV rapid" },
      { img: "https://images.pexels.com/photos/4552980/pexels-photo-4552980.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Riverside camp" },
      { img: "https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Sunrise on the Ganges" },
    ],
  },
  {
    id: "usa",
    layout: "wide",
    label: "USA",
    title: "City Lights — NYC, LA, Chicago",
    image:
      "https://images.pexels.com/photos/1486785/pexels-photo-1486785.jpeg?auto=compress&cs=tinysrgb&w=1600",
    heroVideo:
      "https://videos.pexels.com/video-files/3066465/3066465-uhd_3840_2160_24fps.mp4",
    tagline:
      "Skyline penthouses, Broadway nights, helicopter circuits over Manhattan.",
    intro:
      "Twelve days across America's three most cinematic cities. Manhattan penthouse with Central Park views. A Beverly Hills villa with a chef on call. A river-view suite on the Chicago Riverwalk. Helicopter rides, theatre tickets, the table at Carbone — held for you.",
    body: "New York is six nights of museums, jazz at Smalls, a private MoMA tour after-hours, and helicopter circuits at sunset. LA is four nights of beach mornings, Hollywood Hills evenings, and one secret omakase counter in the Arts District. Chicago wraps with three nights of architecture cruises, deep-dish disagreements, and the Art Institute on a Tuesday morning when nobody else is there.",
    days: "12 Days",
    season: "April — June, September — November",
    from: "₹9,40,000 / $11,400 per guest",
    style: "City · Luxury",
    gallery: [
      { img: "https://images.pexels.com/photos/802024/pexels-photo-802024.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Manhattan night" },
      { img: "https://images.pexels.com/photos/1115804/pexels-photo-1115804.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Helicopter approach" },
      { img: "https://images.pexels.com/photos/2293027/pexels-photo-2293027.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Chicago skyline" },
    ],
  },
  {
    id: "london",
    layout: "",
    label: "London · Amsterdam",
    title: "European Classics",
    image:
      "https://images.pexels.com/photos/258117/pexels-photo-258117.jpeg?auto=compress&cs=tinysrgb&w=1200",
    heroVideo:
      "https://videos.pexels.com/video-files/2932301/2932301-uhd_3840_2160_24fps.mp4",
    tagline:
      "A week of Mayfair townhouses, canal-side lunches, and museums on Monday mornings.",
    intro:
      "Nine days, two cities, the version of Europe you imagined as a teenager and never got around to. London four nights at The Connaught, Amsterdam four nights at a private canal-house your concierge has stocked with breakfast for the morning you arrive.",
    body: "In London: a Royal Opera House evening, a Tower of London after-hours private tour, lunch at Rules. In Amsterdam: a private bicycle tour with a historian, the Van Gogh on a Monday before opening, dinner on a canal boat. Eurostar transfer, of course, in Premier.",
    days: "9 Days",
    season: "May — September",
    from: "₹7,10,000 / $8,600 per guest",
    style: "Cultural · Heritage",
    gallery: [
      { img: "https://images.pexels.com/photos/220887/pexels-photo-220887.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Tower Bridge" },
      { img: "https://images.pexels.com/photos/1796727/pexels-photo-1796727.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Amsterdam canal" },
      { img: "https://images.pexels.com/photos/302769/pexels-photo-302769.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Mayfair morning" },
    ],
  },
  {
    id: "mongolia",
    layout: "",
    label: "Mongolia",
    title: "The Steppe Ride",
    image:
      "https://images.pexels.com/photos/3601425/pexels-photo-3601425.jpeg?auto=compress&cs=tinysrgb&w=1200",
    heroVideo:
      "https://videos.pexels.com/video-files/4666752/4666752-uhd_3840_2160_25fps.mp4",
    tagline: "Nomad ger camps, horseback days, the emptiest sky on Earth.",
    intro:
      "Ten days that begin in Ulaanbaatar and end in the Gobi. You will stay in luxury ger camps run by nomadic families, ride small fierce Mongolian horses across the steppe, and witness the eagle hunters of Bayan-Ölgii at the western edge.",
    body: "A jeep-and-driver follows your party across the country (the roads, in places, are concepts). Each ger camp has been chosen for its hosts as much as its setting. You will learn to milk a mare, you will drink fermented yak — and you will sleep under the most uninterrupted stars on the planet.",
    days: "10 Days",
    season: "June — September",
    from: "₹5,95,000 / $7,200 per guest",
    style: "Expedition · Cultural",
    gallery: [
      { img: "https://images.pexels.com/photos/3601447/pexels-photo-3601447.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Ger camp" },
      { img: "https://images.pexels.com/photos/3801427/pexels-photo-3801427.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Horseback day" },
      { img: "https://images.pexels.com/photos/3601441/pexels-photo-3601441.jpeg?auto=compress&cs=tinysrgb&w=900", cap: "Steppe sunset" },
    ],
  },
];
