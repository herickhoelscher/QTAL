import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type CategoryType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { articles, categories, events, issues, photo, properties, videos } from "./seed-data";

process.loadEnvFile?.(".env");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const DAY = 86_400_000;

async function main() {
  const passwordHash = await bcrypt.hash("portal2026", 10);

  const admin = await prisma.adminUser.upsert({
    where: { email: "admin@portal.local" },
    update: {},
    create: {
      name: "Administração",
      email: "admin@portal.local",
      passwordHash,
      role: "ADMIN",
    },
  });

  await prisma.adminUser.upsert({
    where: { email: "redacao@portal.local" },
    update: {},
    create: {
      name: "Redação",
      email: "redacao@portal.local",
      passwordHash,
      role: "EDITOR",
    },
  });

  await prisma.apiSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteName: "Portal Institucional",
      siteDescription:
        "Eventos, matérias, imóveis e vídeos da região, com a curadoria de uma revista.",
      weatherCity: "Toledo,PR,BR",
      cubValue: 2845.71,
      cubReference: "setembro/2026",
      cubUpdatedAt: new Date(),
      whatsappNumber: "5545999998888",
      whatsappMessage: "Ola! Gostaria de assinar a revista.",
      contactPhone: "(45) 99999-8888",
      contactEmail: "contato@portal.local",
      contactAddress: "Toledo, Paraná",
      instagramUrl: "https://instagram.com",
    },
  });

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug_type: { slug: category.slug, type: category.type } },
      update: { name: category.name },
      create: category,
    });
  }

  /** Resolve o id de uma categoria pelo par slug+tipo, que e a chave unica. */
  const categoryIds = new Map<string, string>();
  for (const category of categories) {
    const saved = await prisma.category.findUniqueOrThrow({
      where: { slug_type: { slug: category.slug, type: category.type } },
    });
    categoryIds.set(category.type + ":" + category.slug, saved.id);
  }
  const connectCategories = (type: CategoryType, slugs: string[]) =>
    slugs
      .map((slug) => categoryIds.get(type + ":" + slug))
      .filter((id): id is string => Boolean(id))
      .map((id) => ({ id }));

  // ---------------------------------------------------------------- materias
  for (const [index, article] of articles.entries()) {
    const connect = connectCategories("ARTICLE", article.categories);
    // O update repete o conteudo para que rodar o seed de novo atualize a demo
    // em vez de deixar o banco preso na primeira versao.
    const content = {
      title: article.title,
      subtitle: article.subtitle,
      body: article.body,
      coverImage: article.cover,
      coverAlt: article.title,
      region: article.region,
      status: "PUBLISHED" as const,
      featured: article.featured,
      publishedAt: new Date(Date.now() - index * DAY * 2 - DAY / 4),
      metaTitle: article.title,
      metaDescription: article.subtitle,
    };

    await prisma.article.upsert({
      where: { slug: article.slug },
      update: { ...content, categories: { set: connect } },
      create: {
        ...content,
        slug: article.slug,
        categories: { connect },
        viewCount: Math.floor(Math.random() * 1400) + 80,
        authorId: admin.id,
      },
    });
  }

  // ----------------------------------------------------------------- eventos
  const eventIds = new Map<string, string>();
  for (const event of events) {
    const connect = connectCategories("EVENT", event.categories);
    const content = {
      title: event.title,
      description: event.description,
      date: new Date(event.date),
      location: event.location,
      region: event.region,
      coverImage: event.cover,
      coverAlt: event.title,
      status: "PUBLISHED" as const,
    };

    const saved = await prisma.event.upsert({
      where: { slug: event.slug },
      update: { ...content, categories: { set: connect } },
      create: { ...content, slug: event.slug, categories: { connect } },
    });
    eventIds.set(event.slug, saved.id);

    // Regrava a galeria para o seed continuar idempotente ao rodar de novo.
    await prisma.mediaAsset.deleteMany({ where: { eventId: saved.id } });
    if (event.gallery.length) {
      await prisma.mediaAsset.createMany({
        data: event.gallery.map((item, position) => ({
          url: photo(item.photo),
          altText: item.alt,
          album: item.album,
          position,
          eventId: saved.id,
        })),
      });
    }
  }

  // ------------------------------------------------------------------ imoveis
  for (const property of properties) {
    const content = {
      title: property.title,
      type: property.type,
      city: property.city,
      region: property.region,
      price: property.price ?? null,
      priceOnRequest: property.priceOnRequest ?? false,
      area: property.area,
      bedrooms: property.bedrooms ?? null,
      bathrooms: property.bathrooms ?? null,
      garageSpots: property.garageSpots ?? null,
      description: property.description,
      coverImage: property.cover,
      coverAlt: property.title,
      featured: property.featured,
      status: "PUBLISHED" as const,
    };

    const saved = await prisma.property.upsert({
      where: { slug: property.slug },
      update: content,
      create: { ...content, slug: property.slug },
    });

    await prisma.mediaAsset.deleteMany({ where: { propertyId: saved.id } });
    if (property.gallery.length) {
      await prisma.mediaAsset.createMany({
        data: property.gallery.map((name, position) => ({
          url: photo(name),
          position,
          altText: property.title,
          propertyId: saved.id,
        })),
      });
    }
  }

  // Mapas slug -> id para resolver os vinculos de video logo abaixo.
  const articleIds = new Map(
    (await prisma.article.findMany({ select: { id: true, slug: true } })).map((a) => [a.slug, a.id]),
  );
  const propertyIds = new Map(
    (await prisma.property.findMany({ select: { id: true, slug: true } })).map((p) => [p.slug, p.id]),
  );

  // ------------------------------------------------------------------ videos
  // Video hospedado no YouTube. Quando ligado a um evento, aparece na pagina
  // do evento E na listagem geral de /videos, sem cadastro duplicado.
  for (const [index, video] of videos.entries()) {
    const connect = connectCategories("VIDEO", video.categories);
    const content = {
      title: video.title,
      description: video.description,
      provider: "YOUTUBE" as const,
      externalUrl: "https://www.youtube.com/watch?v=" + video.embedId,
      embedId: video.embedId,
      status: "PUBLISHED" as const,
      featured: video.featured,
      vertical: video.vertical ?? false,
      publishedAt: new Date(Date.now() - index * DAY * 3 - DAY / 2),
      eventId: video.event ? (eventIds.get(video.event) ?? null) : null,
      articleId: video.article ? (articleIds.get(video.article) ?? null) : null,
      propertyId: video.property ? (propertyIds.get(video.property) ?? null) : null,
    };

    await prisma.video.upsert({
      where: { slug: video.slug },
      update: { ...content, categories: { set: connect } },
      create: { ...content, slug: video.slug, categories: { connect } },
    });
  }

  // ------------------------------------------------- edicoes do Modo Revista
  for (const [index, issue] of issues.entries()) {
    const content = {
      title: issue.title,
      description: issue.description,
      coverImage: issue.cover,
      status: "PUBLISHED" as const,
      publishedAt: new Date(Date.now() - index * DAY * 30),
    };

    const saved = await prisma.issue.upsert({
      where: { slug: issue.slug },
      update: content,
      create: { ...content, slug: issue.slug },
    });

    const items = await prisma.article.findMany({
      where: { slug: { in: issue.articles } },
      select: { id: true, slug: true },
    });

    await prisma.issueItem.deleteMany({ where: { issueId: saved.id } });
    await prisma.issueItem.createMany({
      // Respeita a ordem declarada na edicao, nao a ordem que o banco devolveu.
      data: issue.articles
        .map((slug, position) => {
          const article = items.find((item) => item.slug === slug);
          return article ? { issueId: saved.id, articleId: article.id, position } : null;
        })
        .filter((item): item is { issueId: string; articleId: string; position: number } =>
          Boolean(item),
        ),
    });
  }

  const counts = await Promise.all([
    prisma.article.count(),
    prisma.event.count(),
    prisma.video.count(),
    prisma.property.count(),
    prisma.issue.count(),
    prisma.mediaAsset.count(),
  ]);

  console.log("Seed concluído.");
  console.log(
    `Matérias: ${counts[0]} · Eventos: ${counts[1]} · Vídeos: ${counts[2]} · ` +
      `Imóveis: ${counts[3]} · Edições: ${counts[4]} · Fotos de galeria: ${counts[5]}`,
  );
  console.log("Login do painel: admin@portal.local / portal2026");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
