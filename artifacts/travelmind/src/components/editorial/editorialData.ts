export type ContinentName =
  | "North America"
  | "South America"
  | "Asia"
  | "Europe"
  | "Africa"
  | "Oceania";

export const CONTINENTS: ContinentName[] = [
  "North America",
  "South America",
  "Asia",
  "Europe",
  "Africa",
  "Oceania",
];

const PHOTOS = {
  patagonia: "/editorial/editorial_portrait_patagonia_1795622859974.jpg",
  kyoto: "/editorial/editorial_portrait_kyoto_1795622860774.jpg",
  banner: "/editorial/editorial_continent_banner_1795622859871.jpg",
  safari: "/editorial/editorial_savannah_balloon_1795622860525.jpg",
  hotel: "/editorial/editorial_luxury_hotel_1795622862378.jpg",
};

export const BANNER_IMAGE = PHOTOS.banner;
export const SAFARI_IMAGE = PHOTOS.safari;

export interface EditorialDestinationCard {
  id: string;
  placeLabel: string;
  caption: string;
  image: string;
  alt: string;
}

export const IMAGINATION_CARDS: EditorialDestinationCard[] = [
  {
    id: "patagonia",
    placeLabel: "PATAGONIA",
    caption: "El Chalten, Argentina",
    image: PHOTOS.patagonia,
    alt: "Granite peaks and glacial turquoise lake in Patagonia",
  },
  {
    id: "kyoto",
    placeLabel: "KYOTO",
    caption: "Higashiyama, Japan",
    image: PHOTOS.kyoto,
    alt: "Lantern-lit wooden street in Kyoto at dusk",
  },
  {
    id: "wadi-rum",
    placeLabel: "WADI RUM",
    caption: "Ma'an, Jordan",
    image: PHOTOS.hotel,
    alt: "Desert sandstone sanctuary courtyard at sunset",
  },
  {
    id: "serengeti",
    placeLabel: "SERENGETI",
    caption: "Mara Plains, Tanzania",
    image: PHOTOS.safari,
    alt: "Hot air balloon rising over golden savannah plains",
  },
  {
    id: "amalfi",
    placeLabel: "AMALFI",
    caption: "Ravello Coast, Italy",
    image: PHOTOS.banner,
    alt: "Dramatic Mediterranean limestone coastline at twilight",
  },
  {
    id: "fitz-roy",
    placeLabel: "ANDES",
    caption: "Torres Ridge, Chile",
    image: PHOTOS.patagonia,
    alt: "High alpine valley and glacier ridge in the southern Andes",
  },
];

export const CONTINENT_DESTINATIONS: Record<ContinentName, EditorialDestinationCard[]> = {
  "North America": [
    {
      id: "na-banff",
      placeLabel: "ALBERTA",
      caption: "Banff National Park, Canada",
      image: PHOTOS.patagonia,
      alt: "Glacial turquoise alpine lake in Banff",
    },
    {
      id: "na-oaxaca",
      placeLabel: "OAXACA",
      caption: "Hierve el Agua, Mexico",
      image: PHOTOS.hotel,
      alt: "Sunlit stone courtyard terrace overlooking arid hills",
    },
    {
      id: "na-bigsur",
      placeLabel: "CALIFORNIA",
      caption: "Big Sur Coast, United States",
      image: PHOTOS.banner,
      alt: "Steep coastal cliffs meeting deep ocean twilight",
    },
    {
      id: "na-sedona",
      placeLabel: "ARIZONA",
      caption: "Red Rock Canyon, United States",
      image: PHOTOS.safari,
      alt: "Golden light spreading across open desert plains",
    },
    {
      id: "na-yukon",
      placeLabel: "YUKON",
      caption: "Kluane Range, Canada",
      image: PHOTOS.patagonia,
      alt: "Snow-dusted granite peaks above alpine basin",
    },
    {
      id: "na-quebec",
      placeLabel: "QUEBEC",
      caption: "Old Town Lanes, Canada",
      image: PHOTOS.kyoto,
      alt: "Quiet historic cobblestone street lit by evening lanterns",
    },
    {
      id: "na-baja",
      placeLabel: "BAJA SUR",
      caption: "Todos Santos, Mexico",
      image: PHOTOS.hotel,
      alt: "Minimalist stone desert pavilion at sunset",
    },
    {
      id: "na-maine",
      placeLabel: "MAINE",
      caption: "Acadia Headlands, United States",
      image: PHOTOS.banner,
      alt: "Rocky Atlantic headlands at dusk",
    },
  ],
  "South America": [
    {
      id: "sa-patagonia",
      placeLabel: "PATAGONIA",
      caption: "El Chalten, Argentina",
      image: PHOTOS.patagonia,
      alt: "Granite peaks above glacial lagoon in Patagonia",
    },
    {
      id: "sa-atacama",
      placeLabel: "ATACAMA",
      caption: "San Pedro, Chile",
      image: PHOTOS.hotel,
      alt: "Desert sanctuary terrace framed by sandstone cliffs",
    },
    {
      id: "sa-cusco",
      placeLabel: "CUSCO",
      caption: "San Blas Lanes, Peru",
      image: PHOTOS.kyoto,
      alt: "Stone-paved heritage lane under twilight skies",
    },
    {
      id: "sa-uyuni",
      placeLabel: "ALTIPLANO",
      caption: "Potosi Plains, Bolivia",
      image: PHOTOS.safari,
      alt: "Expansive high plateau lit by sunrise",
    },
    {
      id: "sa-torres",
      placeLabel: "MAGALLANES",
      caption: "Torres del Paine, Chile",
      image: PHOTOS.patagonia,
      alt: "Sharp mountain spires reflecting in alpine water",
    },
    {
      id: "sa-cartagena",
      placeLabel: "BOLIVAR",
      caption: "Walled Coast, Colombia",
      image: PHOTOS.banner,
      alt: "Historic coastal stonework beside deep blue sea",
    },
    {
      id: "sa-mendoza",
      placeLabel: "MENDOZA",
      caption: "Uco Valley, Argentina",
      image: PHOTOS.hotel,
      alt: "Travertine lodge pool overlooking desert ridges",
    },
    {
      id: "sa-galapagos",
      placeLabel: "GALAPAGOS",
      caption: "Isabela Shore, Ecuador",
      image: PHOTOS.banner,
      alt: "Volcanic ocean cliffs at sunset",
    },
  ],
  Asia: [
    {
      id: "as-kyoto",
      placeLabel: "KYOTO",
      caption: "Gion & Higashiyama, Japan",
      image: PHOTOS.kyoto,
      alt: "Lantern-lit wooden street in Kyoto",
    },
    {
      id: "as-ladakh",
      placeLabel: "LADAKH",
      caption: "Leh Valley, India",
      image: PHOTOS.patagonia,
      alt: "High Himalayan peaks above glacial lake",
    },
    {
      id: "as-wadirum",
      placeLabel: "WADI RUM",
      caption: "Southern Desert, Jordan",
      image: PHOTOS.hotel,
      alt: "Sandstone desert sanctuary pool at dusk",
    },
    {
      id: "as-bagan",
      placeLabel: "BAGAN",
      caption: "Mandalay Plain, Myanmar",
      image: PHOTOS.safari,
      alt: "Sunrise balloon floating above golden plains",
    },
    {
      id: "as-kanazawa",
      placeLabel: "ISHIKAWA",
      caption: "Kanazawa District, Japan",
      image: PHOTOS.kyoto,
      alt: "Quiet wooden teahouse alley at twilight",
    },
    {
      id: "as-jeju",
      placeLabel: "JEJU",
      caption: "Seogwipo Cliffs, South Korea",
      image: PHOTOS.banner,
      alt: "Coastal cliffs overlooking twilight water",
    },
    {
      id: "as-alula",
      placeLabel: "ALULA",
      caption: "Ashar Valley, Saudi Arabia",
      image: PHOTOS.hotel,
      alt: "Desert canyon luxury stone villa at sunset",
    },
    {
      id: "as-kazakh",
      placeLabel: "ALTAI",
      caption: "Kolsai Lakes, Kazakhstan",
      image: PHOTOS.patagonia,
      alt: "Turquoise alpine lake surrounded by jagged peaks",
    },
  ],
  Europe: [
    {
      id: "eu-amalfi",
      placeLabel: "CAMPANIA",
      caption: "Amalfi & Ravello, Italy",
      image: PHOTOS.banner,
      alt: "Italian cliffside town over Mediterranean sea",
    },
    {
      id: "eu-dolomites",
      placeLabel: "SOUTH TYROL",
      caption: "Seceda Ridge, Italy",
      image: PHOTOS.patagonia,
      alt: "Sharp limestone alpine peaks at golden hour",
    },
    {
      id: "eu-brugge",
      placeLabel: "FLANDERS",
      caption: "Bruges Old Quarter, Belgium",
      image: PHOTOS.kyoto,
      alt: "Evening cobblestone street glowing with lanterns",
    },
    {
      id: "eu-mallorca",
      placeLabel: "BALEARICS",
      caption: "Tramuntana Stone, Spain",
      image: PHOTOS.hotel,
      alt: "Minimalist stone terrace overlooking warm hills",
    },
    {
      id: "eu-santorini",
      placeLabel: "CYCLADES",
      caption: "Oia Cliffs, Greece",
      image: PHOTOS.banner,
      alt: "Dramatic coastal cliff village at dusk",
    },
    {
      id: "eu-cappadocia",
      placeLabel: "ANATOLIA",
      caption: "Goreme Valley, Turkey",
      image: PHOTOS.safari,
      alt: "Hot air balloon drifting over golden valleys at dawn",
    },
    {
      id: "eu-chamonix",
      placeLabel: "SAVOIE",
      caption: "Mont Blanc Massif, France",
      image: PHOTOS.patagonia,
      alt: "Glacial alpine ridges and high mountain lake",
    },
    {
      id: "eu-alentejo",
      placeLabel: "ALENTEJO",
      caption: "Comporta Hills, Portugal",
      image: PHOTOS.hotel,
      alt: "Quiet travertine sanctuary pool under sunset sky",
    },
  ],
  Africa: [
    {
      id: "af-serengeti",
      placeLabel: "SERENGETI",
      caption: "Northern Plains, Tanzania",
      image: PHOTOS.safari,
      alt: "Hot air balloon flight over Serengeti savannah",
    },
    {
      id: "af-namib",
      placeLabel: "NAMIB",
      caption: "Sossusvlei, Namibia",
      image: PHOTOS.hotel,
      alt: "Desert stone lodge pool beneath canyon rock",
    },
    {
      id: "af-fez",
      placeLabel: "FES-MEKNES",
      caption: "Fez Medina, Morocco",
      image: PHOTOS.kyoto,
      alt: "Quiet historic alley illuminated by evening lanterns",
    },
    {
      id: "af-capetown",
      placeLabel: "WESTERN CAPE",
      caption: "Chapman's Peak, South Africa",
      image: PHOTOS.banner,
      alt: "Ocean cliffs meeting deep blue water at twilight",
    },
    {
      id: "af-maasai",
      placeLabel: "RIFT VALLEY",
      caption: "Maasai Mara, Kenya",
      image: PHOTOS.safari,
      alt: "Acacia savannah bathed in early sunrise light",
    },
    {
      id: "af-atlas",
      placeLabel: "HIGH ATLAS",
      caption: "Imlil Peaks, Morocco",
      image: PHOTOS.patagonia,
      alt: "High mountain passes and clear valley water",
    },
    {
      id: "af-okavango",
      placeLabel: "NGAMILAND",
      caption: "Maun Plains, Botswana",
      image: PHOTOS.hotel,
      alt: "Architectural bush retreat overlooking open plains",
    },
    {
      id: "af-zanzibar",
      placeLabel: "UNGUJA",
      caption: "Nungwi Coast, Tanzania",
      image: PHOTOS.banner,
      alt: "Warm coastal waters beside limestone cliffs",
    },
  ],
  Oceania: [
    {
      id: "oc-milford",
      placeLabel: "FIORDLAND",
      caption: "South Island, New Zealand",
      image: PHOTOS.patagonia,
      alt: "Towering mountain peaks above calm alpine lake",
    },
    {
      id: "oc-uluru",
      placeLabel: "RED CENTRE",
      caption: "Northern Territory, Australia",
      image: PHOTOS.hotel,
      alt: "Desert architectural sanctuary beneath red rock",
    },
    {
      id: "oc-great-ocean",
      placeLabel: "VICTORIA",
      caption: "Port Campbell, Australia",
      image: PHOTOS.banner,
      alt: "Limestone coastal cliffs above dark blue surf",
    },
    {
      id: "oc-canterbury",
      placeLabel: "CANTERBURY",
      caption: "Mackenzie Basin, New Zealand",
      image: PHOTOS.safari,
      alt: "Hot air balloon drifting across golden valley grasslands",
    },
    {
      id: "oc-queenstown",
      placeLabel: "OTAGO",
      caption: "Remarkables Range, New Zealand",
      image: PHOTOS.patagonia,
      alt: "Jagged alpine ridge reflecting in clear glacial water",
    },
    {
      id: "oc-kimberley",
      placeLabel: "KIMBERLEY",
      caption: "Broome Ridge, Australia",
      image: PHOTOS.hotel,
      alt: "Sun-baked travertine stone courtyard at dusk",
    },
    {
      id: "oc-tasmania",
      placeLabel: "TASMANIA",
      caption: "Freycinet Coast, Australia",
      image: PHOTOS.banner,
      alt: "Granite coastal bay at twilight",
    },
    {
      id: "oc-arrowtown",
      placeLabel: "WAKATIPU",
      caption: "Arrowtown, New Zealand",
      image: PHOTOS.kyoto,
      alt: "Quiet historic timber street glowing at dusk",
    },
  ],
};

export interface EditorialHotelCard {
  id: string;
  name: string;
  location: string;
  nights: string;
  price: string;
  image: string;
  alt: string;
}

export const HOTEL_CARDS: EditorialHotelCard[] = [
  {
    id: "hotel-alula",
    name: "DAR TANTORA SANCTUARY",
    location: "AlUla Canyon, Saudi Arabia",
    nights: "4 Nights",
    price: "$1,680",
    image: PHOTOS.hotel,
    alt: "Dar Tantora Sanctuary courtyard pool at dusk",
  },
  {
    id: "hotel-kyoto",
    name: "SHINMONZEN MACHIYA",
    location: "Gion Shirakawa, Kyoto",
    nights: "3 Nights",
    price: "$1,240",
    image: PHOTOS.kyoto,
    alt: "Shinmonzen traditional timber street in Kyoto",
  },
  {
    id: "hotel-amalfi",
    name: "PALAZZO AVINO CLIFF HOUSE",
    location: "Ravello, Amalfi Coast",
    nights: "5 Nights",
    price: "$2,350",
    image: PHOTOS.banner,
    alt: "Palazzo Avino overlooking Mediterranean cliffs",
  },
  {
    id: "hotel-serengeti",
    name: "KIRAWIRA RIDGE CAMP",
    location: "Western Corridor, Serengeti",
    nights: "4 Nights",
    price: "$2,890",
    image: PHOTOS.safari,
    alt: "Kirawira savannah sunrise over Serengeti plains",
  },
  {
    id: "hotel-patagonia",
    name: "EXPLORA LAGO CHALTEN",
    location: "Santa Cruz, Patagonia",
    nights: "5 Nights",
    price: "$2,120",
    image: PHOTOS.patagonia,
    alt: "Explora alpine view of Fitz Roy glacial lake",
  },
];

export interface EditorialBlogPost {
  id: string;
  category: string;
  date: string;
  headline: string;
  excerpt: string;
  image: string;
  alt: string;
}

export const BLOG_POSTS: EditorialBlogPost[] = [
  {
    id: "blog-kyoto-dawn",
    category: "FIELD NOTES",
    date: "NOV 2026",
    headline: "HOW TO WALK KYOTO BEFORE THE CITY WAKES UP",
    excerpt:
      "Timing temple alleys, reading morning transit rhythms, and ordering neighborhood breakfasts without a single queue.",
    image: PHOTOS.kyoto,
    alt: "Quiet wooden Kyoto street before dawn",
  },
  {
    id: "blog-serengeti-pack",
    category: "DISPATCH",
    date: "OCT 2026",
    headline: "PACKING FOR SAVANNAH DAWNS AND DESERT NIGHTS",
    excerpt:
      "Why wide temperature swings demand modular layers, and how our weather desk plots wind and dust windows.",
    image: PHOTOS.safari,
    alt: "Sunrise hot air balloon above the Serengeti",
  },
  {
    id: "blog-amalfi-shoulder",
    category: "COASTAL GUIDE",
    date: "SEP 2026",
    headline: "THE CASE FOR VISITING CLIFFSIDE TOWNS IN NOVEMBER",
    excerpt:
      "Cooler coastal trails, open trattorias, and fewer ferry bottlenecks along the southern Mediterranean ridge.",
    image: PHOTOS.banner,
    alt: "Mediterranean cliffside town at twilight",
  },
  {
    id: "blog-patagonia-budget",
    category: "LEDGER",
    date: "AUG 2026",
    headline: "MAPPING REAL DAILY COSTS ACROSS SOUTHERN PATAGONIA",
    excerpt:
      "Separating cash-only trailhead refugios from advance park permits so your currency buffer never runs dry.",
    image: PHOTOS.patagonia,
    alt: "Turquoise glacial lake beneath Patagonia spires",
  },
];
