import type { Facet } from "@craft/shared";

export type SeedCategory = {
  name: string;
  slug: string;
  facet: Facet;
  emoji: string;
  cardColor: string;
  description: string;
  showInNavbar?: boolean;
  showInFooter?: boolean;
};

const PEACH = "#FDE3D3";
const MINT = "#D9F1EC";
const BUTTER = "#FFF1C1";
const PINK = "#FBD9E5";

export const CATEGORIES: SeedCategory[] = [
  // Audience — "Who's crafting?"
  { facet: "audience", name: "Toddler & Preschool", slug: "toddler-preschool", emoji: "🧸", cardColor: PEACH, showInFooter: true, description: "Big shapes, chunky crayons and glue sticks. Short, sweet crafts for little hands ages 2–5." },
  { facet: "audience", name: "Kids", slug: "kids", emoji: "🖍️", cardColor: MINT, showInFooter: true, description: "Rainy-day saviours for ages 5–10: color, cut, fold and show off by dinnertime." },
  { facet: "audience", name: "Classroom & Teachers", slug: "classroom-teachers", emoji: "🍎", cardColor: BUTTER, showInFooter: true, showInNavbar: true, description: "Print-a-class-set activities with low prep, cheap supplies and easy cleanup." },
  { facet: "audience", name: "Tweens & Teens", slug: "tweens-teens", emoji: "🎧", cardColor: PINK, showInFooter: true, description: "Cooler, more detailed projects — origami, bookmarks and room decor they'll actually keep." },
  { facet: "audience", name: "Adults", slug: "adults", emoji: "☕", cardColor: MINT, showInFooter: true, description: "Relaxing coloring, gift tags and paper projects for grown-ups who need a creative hour." },
  { facet: "audience", name: "Family Crafts", slug: "family-crafts", emoji: "👨‍👩‍👧", cardColor: PEACH, showInFooter: true, description: "One table, every age. Crafts the whole family can work on together." },

  // Season / holiday
  { facet: "season", name: "Fall", slug: "fall", emoji: "🍂", cardColor: PEACH, showInFooter: true, showInNavbar: true, description: "Leaves, pumpkins, scarecrows and cozy autumn printables for September through November." },
  { facet: "season", name: "Halloween", slug: "halloween", emoji: "🎃", cardColor: BUTTER, showInFooter: true, showInNavbar: true, description: "Not-too-spooky crafts, masks and cut-and-paste haunted fun for October." },
  { facet: "season", name: "Thanksgiving", slug: "thanksgiving", emoji: "🦃", cardColor: PEACH, showInFooter: true, description: "Handprint turkeys, gratitude crafts and kids' table activities for Thanksgiving." },
  { facet: "season", name: "Christmas", slug: "christmas", emoji: "🎄", cardColor: MINT, showInFooter: true, description: "Gift tags, ornaments, reindeer and holiday printables to fill December with glue and glitter." },
  { facet: "season", name: "Winter", slug: "winter", emoji: "❄️", cardColor: MINT, showInFooter: true, description: "Snowflakes, snowmen and mitten crafts for the long indoor days of January and February." },
  { facet: "season", name: "Valentine's Day", slug: "valentines-day", emoji: "💌", cardColor: PINK, showInFooter: true, description: "Heart crafts, class valentines and bookmarks to share a little love." },
  { facet: "season", name: "Easter", slug: "easter", emoji: "🐰", cardColor: PINK, showInFooter: true, description: "Bunnies, eggs and spring baskets — Easter crafts and printable games." },
  { facet: "season", name: "Spring", slug: "spring", emoji: "🌷", cardColor: MINT, showInFooter: true, description: "Flowers, rainbows and garden-themed printables for March through May." },
  { facet: "season", name: "Summer", slug: "summer", emoji: "☀️", cardColor: BUTTER, showInFooter: true, description: "Boredom busters, road-trip games and sunny crafts for the school holidays." },
  { facet: "season", name: "Back to School", slug: "back-to-school", emoji: "✏️", cardColor: BUTTER, showInFooter: true, description: "First-day signs, pencil toppers and classroom crafts to kick off the school year." },

  // Craft type
  { facet: "craftType", name: "Coloring Pages", slug: "coloring-pages", emoji: "🖍️", cardColor: BUTTER, showInNavbar: true, description: "Free printable coloring pages — simple outlines for little ones and detailed designs for big kids and adults." },
  { facet: "craftType", name: "Paper Crafts", slug: "paper-crafts", emoji: "📄", cardColor: PEACH, showInNavbar: true, description: "Fold it, curl it, glue it. Easy paper crafts using cardstock and construction paper." },
  { facet: "craftType", name: "Cut & Paste", slug: "cut-and-paste", emoji: "✂️", cardColor: MINT, description: "Scissor-skills printables: cut out the pieces and paste to build a picture." },
  { facet: "craftType", name: "Templates & Cutouts", slug: "templates-cutouts", emoji: "📐", cardColor: BUTTER, showInNavbar: true, description: "Printable craft templates in multiple sizes — trace, cut and create." },
  { facet: "craftType", name: "Printable Games & Puzzles", slug: "printable-games-puzzles", emoji: "🎲", cardColor: PINK, description: "Bingo, scavenger hunts, mazes and word games you can print in seconds." },
  { facet: "craftType", name: "Worksheets", slug: "worksheets", emoji: "📝", cardColor: MINT, description: "Playful learning pages — counting, tracing and fine-motor practice with a craft twist." },
  { facet: "craftType", name: "Cards & Tags", slug: "cards-tags", emoji: "💳", cardColor: PEACH, description: "Printable greeting cards, gift tags and thank-you notes kids can color and sign." },
  { facet: "craftType", name: "Paper Plate Crafts", slug: "paper-plate-crafts", emoji: "🍽️", cardColor: BUTTER, description: "The humble paper plate turned into pumpkins, animals, masks and more." },
  { facet: "craftType", name: "Handprint Crafts", slug: "handprint-crafts", emoji: "🖐️", cardColor: PINK, description: "Keepsake handprint and footprint crafts with printable templates and poems." },
  { facet: "craftType", name: "Party Printables", slug: "party-printables", emoji: "🎉", cardColor: PINK, description: "Banners, cupcake toppers, place cards and party activities to print at home." },
  { facet: "craftType", name: "Bookmarks", slug: "bookmarks", emoji: "🔖", cardColor: MINT, description: "Color-your-own and corner bookmarks for every season and reader." },
  { facet: "craftType", name: "Origami", slug: "origami", emoji: "🦢", cardColor: PEACH, description: "Step-by-step origami with printable folding guides — from beginner to ‘wow’." },
];

export type SeedPost = {
  title: string;
  slug: string;
  excerpt: string;
  categories: string[];
  tags: string[];
  ageRange: string;
  difficulty: "Easy" | "Medium";
  timeNeeded: string;
  supplies: { name: string; affiliateUrl?: string }[];
  intro: string[];
  steps: { title: string; text: string }[];
  tips: string[];
  motif: string;
  bg: string;
  accent: string;
  isPick?: boolean;
  requireEmail?: boolean;
  daysAgo: number;
  focusKeyword: string;
};

export const POSTS: SeedPost[] = [
  {
    title: "Paper Plate Pumpkin Craft (Free Printable Template)",
    slug: "paper-plate-pumpkin-craft",
    excerpt: "A chunky, cheerful paper plate pumpkin with a free printable leaf-and-stem template. Perfect for toddlers and preschool fall crafts.",
    categories: ["fall", "toddler-preschool", "paper-plate-crafts", "templates-cutouts"],
    tags: ["Printable", "Ages 3+"],
    ageRange: "Ages 3+",
    difficulty: "Easy",
    timeNeeded: "20 min",
    supplies: [
      { name: "Paper plates (uncoated)" },
      { name: "Orange tempera paint or tissue paper squares" },
      { name: "Green and brown cardstock" },
      { name: "Glue stick", affiliateUrl: "https://www.example.com/glue-sticks" },
      { name: "Kid-safe scissors" },
      { name: "Free pumpkin stem template (below)" },
    ],
    intro: [
      "Every fall our kitchen table turns into a tiny pumpkin patch, and this paper plate pumpkin is always the first craft out of the bin. It's forgiving, it's bright, and it uses things you probably already have.",
      "The free printable template gives you a stem, two leaves and a curly vine in three sizes, so little hands only need to color, snip and stick.",
      "We've made these with a room full of four-year-olds and with one very determined toddler — both versions ended up proudly on the fridge.",
    ],
    steps: [
      { title: "Print and color the template", text: "Print the stem and leaf template on cardstock. Let kids color the leaves green and the stem brown, or skip coloring and print on colored cardstock." },
      { title: "Paint the plate orange", text: "Paint the back of the paper plate orange. For less mess, glue on torn orange tissue paper instead — toddlers love the tearing part." },
      { title: "Cut out the pieces", text: "Cut out the stem, leaves and vine. Pre-cut for under-threes; older preschoolers can cut along the thick lines for scissor practice." },
      { title: "Glue it all together", text: "Once the paint is dry, glue the stem to the top and tuck the leaves and vine beside it. Draw a smile to turn it into a jack-o'-lantern!" },
    ],
    tips: [
      "Use uncoated plates — paint beads up on glossy ones.",
      "For a classroom, set up a painting station and a gluing station to keep the flow moving.",
      "Make a pumpkin patch wall: add each child's name to a leaf.",
    ],
    motif: "pumpkin",
    bg: "#FDE3D3",
    accent: "#F26B1D",
    isPick: true,
    daysAgo: 2,
    focusKeyword: "paper plate pumpkin craft",
  },
  {
    title: "Fall Leaf Coloring Pages (12 Free Printables)",
    slug: "fall-leaf-coloring-pages",
    excerpt: "Twelve free printable fall leaf coloring pages — maple, oak, ginkgo and more — from simple outlines to detailed patterns.",
    categories: ["fall", "kids", "coloring-pages"],
    tags: ["Printable", "Coloring"],
    ageRange: "Ages 4+",
    difficulty: "Easy",
    timeNeeded: "15 min",
    supplies: [{ name: "Printer paper or cardstock" }, { name: "Crayons, markers or colored pencils" }, { name: "Real leaves for inspiration (optional)" }],
    intro: [
      "These fall leaf coloring pages started as a nature-walk activity: we collected leaves, came home and tried to match them on paper.",
      "The set includes 12 pages — big bold leaves for younger kids and zentangle-style leaves for older kids and grown-ups who want something more relaxing.",
    ],
    steps: [
      { title: "Download and print", text: "Grab the PDF below and print the pages you want. Cardstock holds up better if you plan to cut the leaves out afterwards." },
      { title: "Go on a leaf hunt", text: "Collect a few real leaves and talk about colors — red, orange, yellow, brown, even purple!" },
      { title: "Color and display", text: "Color the pages, cut out the leaves and string them into a garland or tape them to a window." },
    ],
    tips: ["Try watercolor pencils and a damp brush for a soft, blended look.", "Laminate a set for reusable dry-erase coloring."],
    motif: "leaf",
    bg: "#FFF1C1",
    accent: "#F26B1D",
    daysAgo: 5,
    focusKeyword: "fall leaf coloring pages",
  },
  {
    title: "Cut and Paste Haunted House Craft for Kids",
    slug: "cut-and-paste-haunted-house",
    excerpt: "A not-too-spooky cut and paste haunted house printable with ghosts, bats and pumpkins to arrange however kids like.",
    categories: ["halloween", "classroom-teachers", "cut-and-paste"],
    tags: ["No glue gun", "Classroom"],
    ageRange: "Ages 4–8",
    difficulty: "Easy",
    timeNeeded: "25 min",
    supplies: [{ name: "Printed haunted house template" }, { name: "Scissors" }, { name: "Glue stick" }, { name: "Crayons" }],
    intro: [
      "This cut and paste haunted house is our go-to Halloween class party craft: one sheet per child, zero prep beyond printing.",
      "Kids color the house, cut out the ghosts, bats and pumpkins, then decide where everything lives. No two houses ever look the same.",
    ],
    steps: [
      { title: "Print both pages", text: "Page one is the house, page two has the pieces. Print in black and white to save ink — the coloring is half the fun." },
      { title: "Color everything", text: "Encourage wild colors. A purple house with green ghosts? Absolutely." },
      { title: "Cut out the pieces", text: "Cut along the dashed lines. The pieces are chunky, so it's great scissor practice." },
      { title: "Paste and decorate", text: "Glue the pieces in windows, on the roof and around the door. Add stickers or googly eyes if you have them." },
    ],
    tips: ["Copy page two on orange paper for instant pumpkins.", "Older kids can write a short spooky story on the back."],
    motif: "house",
    bg: "#E0F2EE",
    accent: "#F26B1D",
    daysAgo: 9,
    focusKeyword: "cut and paste haunted house",
  },
  {
    title: "Handprint Turkey Thank-You Cards",
    slug: "handprint-turkey-thank-you-cards",
    excerpt: "Printable handprint turkey cards with a sweet gratitude poem — a Thanksgiving keepsake kids can make in 15 minutes.",
    categories: ["thanksgiving", "family-crafts", "handprint-crafts", "cards-tags"],
    tags: ["Keepsake", "Ages 2+"],
    ageRange: "Ages 2+",
    difficulty: "Easy",
    timeNeeded: "15 min",
    supplies: [{ name: "Printed card template on cardstock" }, { name: "Washable paint (brown, orange, red, yellow)" }, { name: "Paper plate for paint" }, { name: "Baby wipes (trust me)" }],
    intro: [
      "Handprint turkeys are a Thanksgiving classic for a reason — and these printable thank-you cards turn them into a keepsake grandparents actually frame.",
      "The card includes a short gratitude poem and a spot for the date, so you'll remember exactly how small those hands were.",
    ],
    steps: [
      { title: "Print and fold the card", text: "Print on white cardstock and fold in half along the dotted line." },
      { title: "Paint the hand", text: "Paint the palm brown and each finger a different feather color." },
      { title: "Press and dry", text: "Press firmly in the frame on the front of the card. Let it dry for 10 minutes." },
      { title: "Add the details", text: "Draw a beak, eyes and legs, then sign the inside with the date." },
    ],
    tips: ["Do the handprint first thing in the morning when wiggles are lowest.", "For a no-mess version, trace the hand and color it in."],
    motif: "turkey",
    bg: "#FDE3D3",
    accent: "#F26B1D",
    isPick: true,
    requireEmail: true,
    daysAgo: 12,
    focusKeyword: "handprint turkey",
  },
  {
    title: "Fall Leaf Garland Template (Printable)",
    slug: "fall-leaf-garland-template",
    excerpt: "Print, color and string this easy fall leaf garland — a cozy autumn decoration the whole family can make together.",
    categories: ["fall", "family-crafts", "templates-cutouts", "paper-crafts"],
    tags: ["Decor", "Printable"],
    ageRange: "Ages 4+",
    difficulty: "Easy",
    timeNeeded: "30 min",
    supplies: [{ name: "Leaf template on colored cardstock" }, { name: "Hole punch" }, { name: "Twine or yarn" }, { name: "Markers" }],
    intro: [
      "This fall leaf garland lives on our mantel from September to Thanksgiving. Everyone writes something they're grateful for on a leaf.",
      "The template has five leaf shapes in two sizes, so you can mix and match for a full, layered look.",
    ],
    steps: [
      { title: "Print the leaves", text: "Print on red, orange, yellow and brown cardstock." },
      { title: "Cut and decorate", text: "Cut out the leaves and add veins, patterns or gratitude notes." },
      { title: "Punch and string", text: "Punch two holes at the top of each leaf and thread onto twine." },
    ],
    tips: ["Alternate big and small leaves.", "Add a pinch of glitter glue for sparkle."],
    motif: "leaf",
    bg: "#FDE3D3",
    accent: "#14998A",
    daysAgo: 15,
    focusKeyword: "fall leaf garland",
  },
  {
    title: "Easy Paper Snowflake Templates (6 Designs)",
    slug: "paper-snowflake-templates",
    excerpt: "Six printable paper snowflake templates with fold-and-cut guides — from beginner to wow-worthy.",
    categories: ["winter", "tweens-teens", "templates-cutouts", "paper-crafts"],
    tags: ["Window decor"],
    ageRange: "Ages 7+",
    difficulty: "Medium",
    timeNeeded: "20 min",
    supplies: [{ name: "Printer paper" }, { name: "Sharp scissors" }, { name: "Tape or string for hanging" }],
    intro: [
      "Paper snowflakes look magical but can be frustrating without a guide. These templates show exactly where to fold and cut.",
      "Start with the simple star and work up to the lacy ‘blizzard’ design — tweens love the challenge.",
    ],
    steps: [
      { title: "Print and cut the square", text: "Print the template and cut along the outer square." },
      { title: "Fold along the guides", text: "Fold in half, then into thirds following the dotted lines." },
      { title: "Cut the shaded areas", text: "Cut away the grey shapes, keeping the folds intact." },
      { title: "Unfold carefully", text: "Gently open your snowflake and press flat under a book." },
    ],
    tips: ["Thinner paper is easier to cut through all the layers.", "Hang them at different heights for a snowfall effect."],
    motif: "snowflake",
    bg: "#E0F2EE",
    accent: "#14998A",
    daysAgo: 20,
    focusKeyword: "paper snowflake templates",
  },
  {
    title: "Printable Christmas Gift Tags to Color",
    slug: "printable-christmas-gift-tags",
    excerpt: "Free printable Christmas gift tags kids can color — 24 designs with stars, trees and reindeer.",
    categories: ["christmas", "adults", "cards-tags", "party-printables"],
    tags: ["Gift wrap"],
    ageRange: "All ages",
    difficulty: "Easy",
    timeNeeded: "15 min",
    supplies: [{ name: "Cardstock" }, { name: "Colored pencils" }, { name: "Hole punch" }, { name: "Ribbon or baker's twine", affiliateUrl: "https://www.example.com/bakers-twine" }],
    intro: ["Handmade tags make even a simple present feel special. Print a sheet, color while you watch a holiday movie, and you're set for the season."],
    steps: [
      { title: "Print on cardstock", text: "Four sheets, six tags each." },
      { title: "Color the designs", text: "Kids can color the simple tags; grown-ups can take the detailed ones." },
      { title: "Cut, punch and tie", text: "Cut out, punch the circle and tie onto gifts with ribbon." },
    ],
    tips: ["Print extras — they disappear fast!", "A gold gel pen makes everything look fancy."],
    motif: "star",
    bg: "#D9F1EC",
    accent: "#FFD84D",
    daysAgo: 24,
    focusKeyword: "printable christmas gift tags",
  },
  {
    title: "Reindeer Paper Bag Puppet",
    slug: "reindeer-paper-bag-puppet",
    excerpt: "A giggly reindeer paper bag puppet with a printable template — great for preschool Christmas parties.",
    categories: ["christmas", "toddler-preschool", "paper-crafts"],
    tags: ["Puppet", "Ages 3+"],
    ageRange: "Ages 3+",
    difficulty: "Easy",
    timeNeeded: "20 min",
    supplies: [{ name: "Brown paper lunch bags" }, { name: "Printed antler & face template" }, { name: "Red pompom" }, { name: "Glue stick" }],
    intro: ["Paper bag puppets are pure toddler magic. This reindeer comes with antlers, eyes and a nose template so it's ready in minutes."],
    steps: [
      { title: "Print and cut the pieces", text: "Cut out the antlers, eyes and muzzle." },
      { title: "Glue to the bag", text: "The bag's flap becomes the reindeer's head — glue the face pieces there." },
      { title: "Add the nose", text: "Finish with a red pompom nose and put on a puppet show!" },
    ],
    tips: ["Trace kids' hands on brown paper for extra-big antlers."],
    motif: "reindeer",
    bg: "#FFF1C1",
    accent: "#B5651D",
    daysAgo: 28,
    focusKeyword: "reindeer paper bag puppet",
  },
  {
    title: "Valentine's Day Heart Bookmarks (Printable)",
    slug: "valentines-heart-bookmarks",
    excerpt: "Printable heart corner bookmarks and color-your-own bookmarks — an easy class valentine.",
    categories: ["valentines-day", "kids", "bookmarks"],
    tags: ["Class valentine"],
    ageRange: "Ages 5+",
    difficulty: "Easy",
    timeNeeded: "15 min",
    supplies: [{ name: "Pink and red cardstock" }, { name: "Scissors" }, { name: "Glue stick" }],
    intro: ["Bookmarks make the best non-candy valentines. This set has heart corner bookmarks plus classic strip bookmarks with sweet sayings."],
    steps: [
      { title: "Print and cut", text: "Print the template and cut out the corner shape." },
      { title: "Fold and glue", text: "Fold the flaps over and glue to form the pocket." },
      { title: "Decorate", text: "Add a heart on the front and a name on the back." },
    ],
    tips: ["Slip one into a library book for a surprise."],
    motif: "heart",
    bg: "#FBD9E5",
    accent: "#F26B1D",
    daysAgo: 35,
    focusKeyword: "valentine bookmarks",
  },
  {
    title: "Easy Origami Easter Bunny",
    slug: "origami-easter-bunny",
    excerpt: "Fold an adorable origami Easter bunny with our printable step-by-step guide.",
    categories: ["easter", "tweens-teens", "origami"],
    tags: ["Origami"],
    ageRange: "Ages 8+",
    difficulty: "Medium",
    timeNeeded: "15 min",
    supplies: [{ name: "Square origami paper (15 cm)" }, { name: "Printed folding guide" }, { name: "Marker for the face" }],
    intro: ["This origami bunny takes just eight folds. Print the guide and fold along — it makes a cute basket topper."],
    steps: [
      { title: "Make a triangle", text: "Fold the square in half diagonally." },
      { title: "Fold the ears", text: "Fold the two corners up to make long ears." },
      { title: "Shape the head", text: "Tuck the bottom point behind and add a face." },
    ],
    tips: ["Patterned paper makes extra-cute bunnies."],
    motif: "bunny",
    bg: "#FBD9E5",
    accent: "#FFFFFF",
    daysAgo: 40,
    focusKeyword: "origami easter bunny",
  },
  {
    title: "Spring Flower Counting Worksheets",
    slug: "spring-flower-counting-worksheets",
    excerpt: "Printable spring flower counting worksheets for preschool and kindergarten — count, color and cut.",
    categories: ["spring", "classroom-teachers", "worksheets"],
    tags: ["Math", "Preschool"],
    ageRange: "Ages 3–6",
    difficulty: "Easy",
    timeNeeded: "15 min",
    supplies: [{ name: "Printed worksheets" }, { name: "Crayons" }, { name: "Mini erasers or buttons as counters (optional)" }],
    intro: ["These spring counting worksheets mix math with a little craft: count the petals, color the flowers, then cut and paste the right number."],
    steps: [
      { title: "Count the petals", text: "Each flower has 1–10 petals — count them aloud." },
      { title: "Color by number", text: "Use the color key to color each flower." },
      { title: "Cut and match", text: "Cut the number cards and paste them under the matching flower." },
    ],
    tips: ["Laminate and use with play dough for a reusable center."],
    motif: "flower",
    bg: "#D9F1EC",
    accent: "#FBD9E5",
    daysAgo: 48,
    focusKeyword: "spring counting worksheets",
  },
  {
    title: "Summer Bingo Printable Game",
    slug: "summer-bingo-printable",
    excerpt: "A free printable summer bingo game with 10 different cards — perfect for road trips and backyard parties.",
    categories: ["summer", "family-crafts", "printable-games-puzzles"],
    tags: ["Game", "Road trip"],
    ageRange: "Ages 4+",
    difficulty: "Easy",
    timeNeeded: "10 min",
    supplies: [{ name: "Printed bingo cards" }, { name: "Calling cards" }, { name: "Markers or cereal pieces" }],
    intro: ["Summer bingo saved our last road trip. Ten unique cards, picture calls for pre-readers, and nothing to set up."],
    steps: [
      { title: "Print the cards", text: "Print the bingo boards and the calling cards." },
      { title: "Cut the calling cards", text: "Cut them apart and put them in a bag or hat." },
      { title: "Play!", text: "Call one card at a time; first to five in a row shouts BINGO." },
    ],
    tips: ["Slip boards into sheet protectors and use dry-erase markers."],
    motif: "sun",
    bg: "#FFF1C1",
    accent: "#FFD84D",
    daysAgo: 60,
    focusKeyword: "summer bingo printable",
  },
  {
    title: "Back to School Pencil Toppers",
    slug: "back-to-school-pencil-toppers",
    excerpt: "Printable pencil toppers for the first day of school — color, cut and slide onto a pencil.",
    categories: ["back-to-school", "kids", "paper-crafts", "cards-tags"],
    tags: ["First day", "No glue"],
    ageRange: "Ages 5+",
    difficulty: "Easy",
    timeNeeded: "15 min",
    supplies: [{ name: "Cardstock" }, { name: "Scissors" }, { name: "Craft knife (adult use)" }, { name: "New pencils" }],
    intro: ["These printable pencil toppers make the first day a little less scary. Teachers love them as welcome gifts, too."],
    steps: [
      { title: "Print and color", text: "Print the toppers and color them in." },
      { title: "Cut out", text: "Cut around each topper." },
      { title: "Slide onto pencils", text: "An adult cuts the two small slits; slide the pencil through." },
    ],
    tips: ["Write each student's name on the back."],
    motif: "pencil",
    bg: "#FFF1C1",
    accent: "#FFD84D",
    isPick: true,
    daysAgo: 70,
    focusKeyword: "pencil toppers printable",
  },
];

export function settingsCopy(brand: string, author: string, handle: string) {
  const first = author.split(" ")[0];
  return {
    siteTitle: brand,
    tagline: "Free printable crafts for every season",
    authorName: author,
    pinterestHandle: handle,
    footerBlurb: `Free printable crafts, templates and coloring pages tested at a real kitchen table. Say hi — ${first} reads every message.`,
    titleTemplate: "%title% | %site%",
    defaultMetaDescription: `${brand} shares free printable crafts for kids, classrooms and grown-ups: coloring pages, paper crafts, templates and seasonal projects you can make in about 15 minutes.`,
    socialLinks: {
      facebook: `https://www.facebook.com/${handle}`,
      instagram: `https://www.instagram.com/${handle}`,
      pinterest: `https://www.pinterest.com/${handle}/`,
    },
    adsTxt: "# Paste your ad network's ads.txt lines here (admin → Settings → Ads)",
    home: {
      heroBadge: "✂️ Real crafts, tested at our kitchen table",
      heroHeadline: "Every season deserves a little craft.",
      heroHighlight: "a little craft.",
      heroParagraph:
        "Free printable templates, coloring pages and easy paper projects for kids, classrooms and grown-ups. Print it, cut it, make it in 15 minutes.",
      stats: [
        { value: "100s", label: "of printables" },
        { value: "100%", label: "free to print" },
        { value: "15 min", label: "avg. craft time" },
        { value: "New", label: "crafts weekly" },
      ],
      seasonRowEyebrow: "🍂 In season now",
      seasonRowTitle: "Fall & Thanksgiving crafts",
      seasonRowSubtitle: "This row fills itself from your newest seasonal posts.",
      seasonRowLinkText: "See all fall crafts →",
      navInSeasonLabel: "Christmas Crafts",
      authorEyebrow: "The person behind the crafts",
      authorHeading: `Hi, I'm ${first} 👋`,
      authorBio: `I'm a former kindergarten teacher, a mom of two very messy kids, and the person who always has a glue stick in her bag. Every craft here gets tested at our kitchen table first — if it takes more than three supplies or ends in tears, it doesn't make the cut. I design the printables myself so you can print, cut and get crafting in minutes.`,
      authorButtonText: `More about ${first} →`,
      usePostPinsFallback: true,
      pins: [],
      newsletterEyebrow: "Free craft printables",
      newsletterHeading: "Never run out of crafts to make",
      newsletterText: "Join thousands of parents and teachers getting one new seasonal printable every week — plus first dibs on holiday packs.",
      newsletterButton: "SEND ME CRAFTS",
    },
  };
}

export function pagesCopy(brand: string, author: string, email: string) {
  const first = author.split(" ")[0];
  const p = (t: string) => `<p>${t}</p>`;
  return [
    {
      slug: "about",
      title: `Hi, I'm ${first} 👋`,
      content:
        p(`Welcome to ${brand}! I'm ${author}, a former kindergarten teacher and the craft-obsessed mom behind every printable on this site.`) +
        p("It started with a rainy Tuesday, two bored kids and a printer. I drew a pumpkin template, we cut it out, and suddenly an afternoon disappeared in the best way. Years later, I still design every template myself and test each craft at our kitchen table before it goes up here.") +
        "<h2>What you'll find here</h2>" +
        "<ul><li>Free printable templates, coloring pages and cut-and-paste crafts</li><li>Seasonal and holiday crafts for every month of the year</li><li>Low-prep classroom activities teachers can print for a whole class</li><li>Relaxing paper projects for grown-ups, too</li></ul>" +
        "<h2>My craft rules</h2>" +
        p("Short supply lists. Clear photos for every step. Tips for different ages. And always, always a free printable."),
    },
    {
      slug: "contact",
      title: "Get in touch",
      content: p(`Have a question about a printable, a craft request, or a collaboration idea? Fill in the form below and I'll get back to you within a few days. You can also email ${email}.`),
    },
    {
      slug: "privacy-policy",
      title: "Privacy Policy",
      content:
        p(`This Privacy Policy explains how ${brand} collects, uses and protects your information when you visit our website.`) +
        "<h2>Information we collect</h2>" +
        p("When you subscribe to our newsletter, download an email-gated printable, leave a comment or contact us, we collect the information you provide (such as your first name and email address). We also collect anonymous usage data through analytics tools.") +
        "<h2>How we use it</h2>" +
        p("We use your email to send the printables and newsletters you asked for. You can unsubscribe at any time using the link in every email. We never sell your personal information.") +
        "<h2>Cookies and advertising</h2>" +
        p("We use cookies for analytics and, where enabled, advertising. See our Cookies Policy for details.") +
        "<h2>Contact</h2>" +
        p(`Questions about privacy? Email ${email}.`),
    },
    {
      slug: "cookies-policy",
      title: "Cookies Policy",
      content:
        p(`${brand} uses cookies to understand how visitors use the site and, where enabled, to show relevant ads.`) +
        "<h2>Types of cookies</h2><ul><li><strong>Essential</strong> — needed for the site to work.</li><li><strong>Analytics</strong> — help us see which crafts are popular.</li><li><strong>Advertising</strong> — set by our ad partners to show relevant ads.</li></ul>" +
        p("You can block or delete cookies in your browser settings."),
    },
    {
      slug: "terms",
      title: "Terms of Use",
      content:
        p(`All printables on ${brand} are free for personal and classroom use. Please don't sell, redistribute or re-host the files — share a link to the post instead.`) +
        p("Crafts involve scissors, glue and small parts; always supervise young children. We're not responsible for any mess (though we apologise in advance for the glitter)."),
    },
    {
      slug: "affiliate-disclosure",
      title: "Affiliate Disclosure",
      content:
        p(`Some posts on ${brand} contain affiliate links. If you buy something through one of those links, we may earn a small commission at no extra cost to you.`) +
        p("We only recommend supplies we actually use at our own craft table. Commissions help keep every printable free."),
    },
    {
      slug: "accessibility",
      title: "Accessibility",
      content:
        p(`We want ${brand} to be usable by everyone. We aim to meet WCAG 2.1 AA: readable contrast, keyboard navigation, descriptive alt text and labelled forms.`) +
        p(`If something on the site is hard to use, please tell us at ${email} and we'll fix it.`),
    },
  ];
}
