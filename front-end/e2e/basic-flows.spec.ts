
import {
  test,
  expect,
  type Page,
} from "@playwright/test";

// Wachtwoorden ophalen uit PowerShell-omgevingsvariabelen
function requiredPassword(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `${name} ontbreekt. Stel de omgevingsvariabele in.`
    );
  }

  return value;
}

// Inloggen via het echte formulier op de website
async function loginViaWebsite(
  page: Page,
  email: string,
  password: string
) {
  await page.goto("/login");

  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);

  await page
    .getByRole("button", { name: /inloggen/i })
    .click();

  // Wachten totdat de gebruiker daadwerkelijk is ingelogd
  await expect(
    page.getByRole("button", { name: "Uitloggen" })
  ).toBeVisible();
}

// TEST 1: Publieke catalogus
test("publieke catalogus toont boeken", async ({ page }) => {
  await page.goto("/catalogus");

  await expect(
    page.getByRole("heading", { level: 1 })
  ).toBeVisible();

  await expect(
    page.locator("article.book-card").first()
  ).toBeVisible();
});

// TEST 2: Niet-ingelogde bezoeker mag advies niet openen
test("uitgelogde bezoeker kan advies niet openen", async ({
  page,
}) => {
  await page.goto("/advies");

  await expect(page).toHaveURL(/\/login\/?$/);
});

// TEST 3: Volledige studentflow
test("student kan profiel, advies en leeslijst openen", async ({
  page,
}) => {
  await loginViaWebsite(
    page,
    "student@vrijlezen.test",
    requiredPassword("E2E_STUDENT_PASSWORD")
  );

  // Leesprofiel openen
  await page
    .getByRole("link", { name: "Leesprofiel" })
    .click();

  await expect(
    page.getByRole("heading", {
      name: "Mijn leesprofiel",
    })
  ).toBeVisible();

  // Persoonlijke adviezen openen
  await page
    .getByRole("link", { name: "Mijn leesadvies" })
    .click();

  await expect(
    page.getByRole("heading", {
      name: "Jouw persoonlijke leesadvies",
    })
  ).toBeVisible();

  // Er moeten drie aanbevelingen verschijnen
  await expect(
    page.locator("article.book-card")
  ).toHaveCount(3);

  // Persoonlijke leeslijst openen
  await page
    .getByRole("link", { name: "Mijn leeslijst" })
    .click();

  await expect(
    page.getByRole("heading", {
      name: "Mijn leeslijst",
    })
  ).toBeVisible();

  // Studenten mogen de docentenomgeving niet openen
  await page.goto("/docent");

  await expect(page).toHaveURL(
    /^http:\/\/localhost:3000\/?$/
  );
});

// TEST 4: Docentflow en autorisatie
test("docent kan docentomgeving openen maar geen advies", async ({
  page,
}) => {
  await loginViaWebsite(
    page,
    "docent@vrijlezen.test",
    requiredPassword("E2E_DOCENT_PASSWORD")
  );

  // Docentenomgeving openen
  await page
    .getByRole("link", { name: "Docentenomgeving" })
    .click();

  await expect(
    page.getByRole("heading", {
      name: "Docentenomgeving",
    })
  ).toBeVisible();

  // Docenten mogen geen persoonlijk studentadvies openen
  await page.goto("/advies");

  await expect(page).toHaveURL(
    /^http:\/\/localhost:3000\/?$/
  );
});

test("student kan gelezen-status wijzigen en opslaan", async ({
  page,
}) => {
  await loginViaWebsite(
    page,
    "student@vrijlezen.test",
    requiredPassword("E2E_STUDENT_PASSWORD")
  );

  // Open de persoonlijke leeslijst
  await page
    .getByRole("link", { name: "Mijn leeslijst" })
    .click();

  // Gebruik een bestaand boek uit de demo-leeslijst
  const card = page
    .locator(".reading-list-grid article.book-card")
    .first();

  await expect(card).toBeVisible();

  const status = card.locator(".reading-status");

  // Bepaal de oorspronkelijke status
  const originalStatus = (await status.innerText()).trim();
  const wasRead = originalStatus === "Gelezen";

  const newStatus = wasRead
    ? "Nog niet gelezen"
    : "Gelezen";

  // Wijzig de status via de website
  await card
    .getByRole("button", {
      name: wasRead
        ? /markeer .* als niet gelezen/i
        : /markeer .* als gelezen/i,
    })
    .click();

  await expect(status).toHaveText(newStatus);

  // Pagina opnieuw laden om persistentie te controleren
  await page.reload();

  const reloadedCard = page
    .locator(".reading-list-grid article.book-card")
    .first();

  await expect(
    reloadedCard.locator(".reading-status")
  ).toHaveText(newStatus);

  // Zet de status terug zodat de test opnieuw kan draaien
  await reloadedCard
    .getByRole("button", {
      name: wasRead
        ? /markeer .* als gelezen/i
        : /markeer .* als niet gelezen/i,
    })
    .click();

  await expect(
    reloadedCard.locator(".reading-status")
  ).toHaveText(originalStatus);
});

test("alleen gekoppelde docent mag studentgegevens bekijken en wijzigen", async ({
  request,
}) => {
  const api = "http://localhost:3001";

  type ApiSession = {
    token: string;
    user: {
      id: number;
    };
  };

  // Inloggen via de echte Fastify-API
  async function apiLogin(
    email: string,
    password: string
  ): Promise<ApiSession> {
    const response = await request.post(
      `${api}/api/auth/login`,
      {
        data: { email, password },
      }
    );

    expect(response.status()).toBe(200);

    return (await response.json()) as ApiSession;
  }

  // Student en beide docenten inloggen
  const [student, docent1, docent2] = await Promise.all([
    apiLogin(
      "student@vrijlezen.test",
      requiredPassword("E2E_STUDENT_PASSWORD")
    ),
    apiLogin(
      "docent@vrijlezen.test",
      requiredPassword("E2E_DOCENT_PASSWORD")
    ),
    apiLogin(
      "docent2@vrijlezen.test",
      requiredPassword("E2E_DOCENT_2_PASSWORD")
    ),
  ]);

  const studentId = student.user.id;

  // Controleren welke docent aan de student gekoppeld is
  async function hasStudent(token: string): Promise<boolean> {
    const response = await request.get(
      `${api}/api/docent/studenten`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(response.status()).toBe(200);

    const data = (await response.json()) as {
      students: { id: number }[];
    };

    return data.students.some(
      (student) => student.id === studentId
    );
  }

  const [docent1HasStudent, docent2HasStudent] =
    await Promise.all([
      hasStudent(docent1.token),
      hasStudent(docent2.token),
    ]);

  // Precies één van de twee docenten is gekoppeld
  expect(
    [docent1HasStudent, docent2HasStudent].filter(Boolean)
  ).toHaveLength(1);

  const allowedToken = docent1HasStudent
    ? docent1.token
    : docent2.token;

  const deniedToken = docent1HasStudent
    ? docent2.token
    : docent1.token;

  const detailUrl =
    `${api}/api/docent/studenten/${studentId}`;

  // Gekoppelde docent mag gegevens bekijken
  const allowedResponse = await request.get(detailUrl, {
    headers: {
      Authorization: `Bearer ${allowedToken}`,
    },
  });

  expect(allowedResponse.status()).toBe(200);

  const detail = await allowedResponse.json();

  expect(detail.student.id).toBe(studentId);
  expect(detail.profile).toBeTruthy();
  expect(detail.readingList).toBeTruthy();

  // Andere docent mag gegevens NIET bekijken
  const deniedResponse = await request.get(detailUrl, {
    headers: {
      Authorization: `Bearer ${deniedToken}`,
    },
  });

  expect(deniedResponse.status()).toBe(404);

  // Zoek een echt catalogusboek voor de schrijftest
  const catalogResponse = await request.get(
    `${api}/api/catalog?page=1&limit=1`
  );

  expect(catalogResponse.status()).toBe(200);

  const catalog = (await catalogResponse.json()) as {
    items: { id: string }[];
  };

  expect(catalog.items.length).toBeGreaterThan(0);

  // Andere docent mag ook GEEN boek toevoegen
  const deniedAddResponse = await request.post(
    `${detailUrl}/leeslijst`,
    {
      headers: {
        Authorization: `Bearer ${deniedToken}`,
      },
      data: {
        bookId: catalog.items[0].id,
      },
    }
  );

  expect(deniedAddResponse.status()).toBe(404);

  // Zonder JWT moet toegang geweigerd worden
  const noTokenResponse = await request.get(detailUrl);

  expect(noTokenResponse.status()).toBe(401);

  // Studenttoken mag docentendpoint niet gebruiken
  const studentResponse = await request.get(detailUrl, {
    headers: {
      Authorization: `Bearer ${student.token}`,
    },
  });

  expect(studentResponse.status()).toBe(403);
});
