/**
 * Seeds the database: first admin (from env), the full taxonomy, homepage
 * settings with real copy, legal pages and ~13 craft posts with original
 * placeholder art + a sample PDF.
 *
 *   npm run seed            # create missing data only (safe to re-run)
 *   npm run seed -- --force # also overwrite existing seed posts/pages
 *
 * Images/PDFs go to Cloudinary when CLOUDINARY_* is set, otherwise they're
 * written to web/public/seed/ so the site still renders locally.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import { config as loadEnv } from "dotenv";
import mongoose from "mongoose";
import {
  Category,
  Comment,
  Page,
  Post,
  SETTINGS_KEY,
  SiteSettings,
  Tag,
  User,
  connectDB,
} from "@craft/db";
import { slugify } from "@craft/shared";
import { authorSvg, featuredSvg, heroSvg, makePdf, pinSvg, printablePreviewSvg, stepSvg } from "./assets";
import { CATEGORIES, POSTS, pagesCopy, settingsCopy } from "./data";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
for (const f of [".env", ".env.local", "admin/.env.local", "admin/.env", "web/.env.local", "web/.env"]) {
  loadEnv({ path: path.join(root, f), quiet: true });
}

const FORCE = process.argv.includes("--force");
const BRAND = process.env.BRAND_NAME || "Paper Pinwheel";
const AUTHOR = process.env.AUTHOR_NAME || "Maya Linden";
const HANDLE = process.env.PINTEREST_HANDLE || "paperpinwheel";
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "hello@example.com";

const useCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}
const localDir = path.join(root, "web/public/seed");

type Stored = { url: string; public_id?: string; bytes: number; width?: number; height?: number };

async function store(name: string, data: string | Buffer, kind: "svg" | "pdf", size?: { w: number; h: number }): Promise<Stored> {
  const buf = typeof data === "string" ? Buffer.from(data, "utf8") : data;
  if (useCloudinary) {
    const mime = kind === "svg" ? "image/svg+xml" : "application/pdf";
    const res = await cloudinary.uploader.upload(`data:${mime};base64,${buf.toString("base64")}`, {
      folder: kind === "pdf" ? "craft-site/printables" : "craft-site/seed",
      public_id: kind === "pdf" ? `${name}.pdf` : name,
      resource_type: kind === "pdf" ? "raw" : "image",
      overwrite: true,
    });
    return { url: res.secure_url, public_id: res.public_id, bytes: res.bytes, width: size?.w ?? res.width, height: size?.h ?? res.height };
  }
  await mkdir(localDir, { recursive: true });
  const file = `${name}.${kind}`;
  await writeFile(path.join(localDir, file), buf);
  return { url: `/seed/${file}`, bytes: buf.length, width: size?.w, height: size?.h };
}

function buildContent(p: (typeof POSTS)[number], stepImages: Stored[]): string {
  const intro = p.intro.map((t) => `<p>${t}</p>`).join("");
  const steps = p.steps
    .map(
      (s, i) =>
        `<h2>Step ${i + 1}: ${s.title}</h2><p>${s.text}</p>` +
        (stepImages[i] ? `<img src="${stepImages[i].url}" alt="${p.title} — step ${i + 1}: ${s.title.toLowerCase()}" width="1200" height="800">` : ""),
    )
    .join("");
  const tips = `<h2>Tips &amp; variations</h2><ul>${p.tips.map((t) => `<li>${t}</li>`).join("")}</ul>`;
  const ages =
    `<h3>Making it work for different ages</h3>` +
    `<p><strong>Little ones:</strong> pre-cut the pieces and let them focus on coloring and sticking. <strong>Big kids:</strong> let them cut everything themselves and invent their own version.</p>` +
    `<blockquote><p>Craft-table tip: lay down an old shower curtain or a sheet of kraft paper first — cleanup takes 30 seconds.</p></blockquote>`;
  return intro + `<h2>Why we love this craft</h2><p>It's quick, it's cheap, and it works for a whole range of ages. Most of the supplies are already in your craft drawer, and the free printable does the tricky part for you.</p>` + steps + tips + ages;
}

async function main() {
  await connectDB();
  console.log(`→ Connected. Assets: ${useCloudinary ? "Cloudinary" : "local web/public/seed"}`);

  // 1. First admin from env — never hardcoded.
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env before seeding.");
  if (password.length < 10) throw new Error("ADMIN_PASSWORD must be at least 10 characters.");
  let admin = await User.findOne({ email });
  if (!admin) {
    admin = await User.create({ name: AUTHOR, email, role: "admin", passwordHash: await bcrypt.hash(password, 12), active: true });
    console.log(`✔ Created admin ${email}`);
  } else {
    if (process.argv.includes("--reset-admin-password")) {
      admin.passwordHash = await bcrypt.hash(password, 12);
      admin.sessionVersion = (admin.sessionVersion ?? 0) + 1;
    }
    admin.role = "admin";
    admin.active = true;
    await admin.save();
    console.log(`✔ Admin ${email} already exists (role ensured)`);
  }

  // Author avatar + bio.
  const avatar = await store("author-portrait", authorSvg(), "svg", { w: 800, h: 1000 });
  const authorBio = `Former kindergarten teacher, mom of two, and the person behind every printable on ${BRAND}.`;
  await User.updateOne(
    { _id: admin._id, $or: [{ bio: { $exists: false } }, { bio: "" }] },
    { $set: { bio: authorBio, avatar: { url: avatar.url, public_id: avatar.public_id, alt: AUTHOR, width: 800, height: 1000 } } },
  );

  // 2. Categories.
  const catIds: Record<string, mongoose.Types.ObjectId> = {};
  for (const [i, c] of CATEGORIES.entries()) {
    const doc = await Category.findOneAndUpdate(
      { slug: c.slug },
      {
        $setOnInsert: {
          name: c.name,
          slug: c.slug,
          facet: c.facet,
          emoji: c.emoji,
          cardColor: c.cardColor,
          description: c.description,
          showInNavbar: !!c.showInNavbar,
          showInFooter: !!c.showInFooter,
          sortOrder: i,
          seo: { title: `${c.name} Crafts & Free Printables`, metaDescription: c.description },
        },
      },
      { upsert: true, returnDocument: "after" },
    );
    catIds[c.slug] = doc!._id;
  }
  console.log(`✔ ${CATEGORIES.length} categories`);

  // 3. Site settings + homepage.
  const copy = settingsCopy(BRAND, AUTHOR, HANDLE);
  const hero = await store("hero-cutout", heroSvg(), "svg", { w: 900, h: 900 });
  const existing = await SiteSettings.findOne({ key: SETTINGS_KEY }).lean();
  if (!existing || FORCE || !existing.home?.heroHeadline) {
    await SiteSettings.updateOne(
      { key: SETTINGS_KEY },
      {
        $set: {
          ...copy,
          permalink: existing?.permalink ?? "post",
          home: {
            ...copy.home,
            heroImage: { url: hero.url, public_id: hero.public_id, alt: "A child's hands holding a finished paper pumpkin craft", width: 900, height: 900 },
            authorPhoto: { url: avatar.url, public_id: avatar.public_id, alt: `Illustrated portrait of ${AUTHOR}`, width: 800, height: 1000 },
            currentSeasonCategoryIds: [catIds["fall"], catIds["thanksgiving"]],
            navInSeasonCategoryId: catIds["christmas"],
          },
        },
      },
      { upsert: true },
    );
    console.log("✔ Site & homepage settings");
  } else console.log("• Settings exist (use --force to overwrite)");

  // 4. Pages.
  for (const pg of pagesCopy(BRAND, AUTHOR, CONTACT_EMAIL)) {
    const exists = await Page.exists({ slug: pg.slug });
    if (exists && !FORCE) continue;
    await Page.updateOne({ slug: pg.slug }, { $set: { ...pg, seo: { title: pg.title.replace(/ 👋$/, "") } } }, { upsert: true });
  }
  console.log("✔ Pages");

  // 5. Posts.
  let created = 0;
  const now = Date.now();
  for (const [i, p] of POSTS.entries()) {
    const exists = await Post.exists({ slug: p.slug });
    if (exists && !FORCE) continue;

    const pin = await store(`${p.slug}-pin`, pinSvg({ title: p.title.replace(/\s*\(.*\)$/, ""), kicker: p.tags[0] ?? "Free printable", bg: p.bg, accent: p.accent, motif: p.motif, brand: BRAND, seed: i + 3 }), "svg", { w: 1000, h: 1500 });
    const featured = await store(`${p.slug}-featured`, featuredSvg({ bg: p.bg, accent: p.accent, motif: p.motif, seed: i }), "svg", { w: 1200, h: 900 });
    const steps: Stored[] = [];
    for (let s = 0; s < Math.min(p.steps.length, 3); s++) {
      steps.push(await store(`${p.slug}-step-${s + 1}`, stepSvg({ bg: p.bg, accent: p.accent, motif: p.motif, step: s + 1 }), "svg", { w: 1200, h: 800 }));
    }
    const preview = await store(`${p.slug}-printable-preview`, printablePreviewSvg({ title: p.title.replace(/\s*\(.*\)$/, ""), motif: p.motif, accent: p.accent }), "svg", { w: 850, h: 1100 });
    const pdf = await store(
      `${p.slug}-printable`,
      makePdf(p.title.replace(/\s*\(.*\)$/, ""), [`Free printable from ${BRAND}`, "Print on cardstock at actual size.", "For personal and classroom use.", ...p.steps.map((s, n) => `${n + 1}. ${s.title}`)]),
      "pdf",
    );

    const tagIds = [];
    for (const name of p.tags) {
      const t = await Tag.findOneAndUpdate({ slug: slugify(name) }, { $setOnInsert: { name, slug: slugify(name) } }, { upsert: true, returnDocument: "after" });
      tagIds.push(t!._id);
    }
    const publishedAt = new Date(now - p.daysAgo * 86_400_000);
    const pinDescription = `${p.excerpt} Grab the free printable and make it in about ${p.timeNeeded}. #${p.focusKeyword.replace(/\s+/g, "")} #kidscrafts #freeprintable`;

    const doc = {
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      content: buildContent(p, steps),
      featuredImage: { url: featured.url, public_id: featured.public_id, alt: `Finished ${p.title.replace(/\s*\(.*\)$/, "").toLowerCase()} on a craft table`, width: 1200, height: 900 },
      pinterestImage: { url: pin.url, public_id: pin.public_id, alt: `${p.title} — Pinterest pin`, width: 1000, height: 1500 },
      pinterestTitle: p.title.slice(0, 100),
      pinterestDescription: pinDescription.slice(0, 500),
      categories: p.categories.map((s) => catIds[s]).filter(Boolean),
      tags: tagIds,
      author: admin._id,
      status: "published",
      publishedAt,
      ageRange: p.ageRange,
      difficulty: p.difficulty,
      timeNeeded: p.timeNeeded,
      supplies: p.supplies,
      printables: [
        {
          title: `${p.title.replace(/\s*\(.*\)$/, "")} printable`,
          fileUrl: pdf.url,
          public_id: pdf.public_id,
          previewImage: { url: preview.url, public_id: preview.public_id, alt: `Preview of the ${p.title.replace(/\s*\(.*\)$/, "").toLowerCase()} printable`, width: 850, height: 1100 },
          pages: 1,
          fileSize: pdf.bytes,
          downloads: Math.floor(40 + ((i * 37) % 160)),
          requireEmail: !!p.requireEmail,
        },
      ],
      isPick: !!p.isPick,
      views: Math.floor(300 + ((i * 113) % 1200)),
      seo: {
        title: p.title,
        metaDescription: p.excerpt.slice(0, 160),
        focusKeyword: p.focusKeyword,
      },
    };
    await Post.updateOne({ slug: p.slug }, { $set: doc }, { upsert: true });
    created++;
    process.stdout.write(".");
  }
  console.log(`\n✔ ${created} posts written (${POSTS.length - created} already existed)`);

  // 6. A couple of approved comments so the comments section renders.
  const pumpkin = await Post.findOne({ slug: "paper-plate-pumpkin-craft" }).select("_id").lean();
  if (pumpkin && !(await Comment.exists({ post: pumpkin._id }))) {
    await Comment.create([
      { post: pumpkin._id, name: "Jess", email: "jess@example.com", body: "Did this with my 3-year-old this morning — she insisted on a purple pumpkin. 10/10 would glue again!", status: "approved" },
      { post: pumpkin._id, name: "Mr. Patel", email: "patel@example.com", body: "Used the template with my pre-K class of 18. The tissue paper version was a hit and cleanup was easy.", status: "approved" },
    ]);
  }

  await Post.syncIndexes();
  console.log("✔ Done. Log in to the admin with ADMIN_EMAIL / ADMIN_PASSWORD.");
}

main()
  .catch((err) => {
    console.error("✘ Seed failed:", err.message ?? err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
