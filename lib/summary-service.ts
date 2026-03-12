import OpenAI from "openai";
import { buildUniveSummaryInput, normalizeFormData, type UniveFormData } from "@/lib/unive-questionnaire";
import { detectPii } from "@/lib/pii-guard";

const DEFAULT_MODEL = "gpt-4o";

// Velden die wél PII mogen bevatten maar niet naar de AI gaan
// (bijv. contactgegevens of demografie die niet in de prompt worden gebruikt).
const PII_SCAN_EXCLUDED_KEYS: (keyof UniveFormData)[] = [
  "q0_leeftijd",
  "q0_gemeente",
  "q19_naam",
  "q19_email",
  "q19_telefoon",
  "q21_email",
];

export function ensureNoPiiInFormData(formData: UniveFormData): void {
  const piiFields: string[] = [];

  for (const [key, value] of Object.entries(formData)) {
    if (PII_SCAN_EXCLUDED_KEYS.includes(key as keyof UniveFormData)) {
      continue;
    }
    if (typeof value === "string") {
      const res = detectPii(value);
      if (res.hasPII) {
        piiFields.push(key);
      }
    } else if (Array.isArray(value)) {
      for (const v of value) {
        if (typeof v !== "string") continue;
        const res = detectPii(v);
        if (res.hasPII) {
          piiFields.push(key);
          break;
        }
      }
    }
  }

  if (piiFields.length > 0) {
    const uniqueFields = Array.from(new Set(piiFields)).sort();
    const fieldsLabel = uniqueFields.join(", ");
    const message =
      "Je antwoorden lijken nog herleidbare gegevens te bevatten (zoals e‑mailadres, telefoonnummer, adres of website). " +
      "Pas deze gegevens in de vragenlijst aan voordat je een samenvatting laat maken. " +
      `(Velden met mogelijke PII: ${fieldsLabel}).`;
    throw new Error(message);
  }
}

function getClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

function isReasoningModel(model: string): boolean {
  return /^gpt-5|^o4|^o3/i.test(model);
}

async function createSummary(
  client: OpenAI,
  model: string,
  systemPrompt: string,
  userContent: string
): Promise<string> {
  const resp = await client.responses.create({
    model,
    ...(isReasoningModel(model) && { reasoning: { effort: "medium" as const } }),
    max_output_tokens: 1200,
    input: [
      { role: "developer", content: systemPrompt },
      { role: "user", content: userContent },
    ],
  });
  return (resp.output_text ?? "").trim();
}

const REVISE_SYSTEM_PROMPT = `Je bent een ervaren, empathische adviseur voor melkveehouders. De melkveehouder heeft eerder een samenvatting gekregen en geeft nu feedback over wat beter of anders moet. Neem even de tijd om alle feedback rustig te lezen en goed te begrijpen voordat je begint met schrijven. Herschrijf de samenvatting zo dat de feedback duidelijk en zorgvuldig is verwerkt, alsof je het verhaal opnieuw vertelt precies zoals de melkveehouder het bedoelt.

Schrijf in het Nederlands, in begrijpelijke taal (niveau B1/B2), met korte en duidelijke zinnen. Gebruik de "je"-vorm (jij/je), alsof je de melkveehouder rechtstreeks aanspreekt. Houd de toon betrokken, begripvol en neutraal: je erkent de situatie en gevoelens, maar geeft geen oordeel en geen advies.

De nieuwe samenvatting heeft altijd precies deze vier koppen, in deze volgorde, gevolgd door één korte alinea per kop:

**Jouw bedrijf en huidige situatie**
Schrijf hier in één lopende alinea hoe het bedrijf en de huidige situatie van de melkveehouder eruitzien. Sluit zo goed mogelijk aan bij de woorden en accenten uit de bestaande samenvatting en de feedback, zodat het voelt als: "dit is echt mijn verhaal".

**Belangrijkste uitdagingen en zorgen**
Schrijf hier in één lopende alinea welke uitdagingen, knelpunten en zorgen de melkveehouder noemt. Gebruik een rustige, neutrale toon. Maak duidelijk wat echt zwaar weegt, maar overdrijf niets en voeg geen eigen voorbeelden toe.

**Hoe je naar de toekomst kijkt**
Schrijf hier in één lopende alinea hoe de melkveehouder naar de toekomst kijkt. Vertel welke verwachtingen, hoop, twijfels en mogelijke veranderingen er spelen, en hoe open de melkveehouder staat voor verandering of ondersteuning, zonder advies te geven.

**Wat voor jou het meest belangrijk is**
Schrijf hier in één lopende alinea wat voor de melkveehouder het meest belangrijk is om verder te kunnen: wat er toe doet in termen van ondersteuning, richting, inkomen en de mogelijkheid om door te gaan met het bedrijf. Sluit af op een rustige en herkenbare manier, zonder aanbevelingen.

Gebruik uitsluitend informatie uit de bestaande samenvatting en de gegeven feedback. Gebruik geen namen, bedrijfsnamen of locaties en verzin geen nieuwe details, emoties of problemen. De tekst is tussen 150 en 400 woorden. Geef alleen de herziene samenvatting, zonder extra uitleg of meta-commentaar.`;

const UNIVE_SYSTEM_PROMPT = `Je bent een ervaren en empathische adviseur voor melkveehouders. Je krijgt de ingevulde vragenlijst van een melkveehouder. Neem even de tijd om alle antwoorden zorgvuldig te lezen en goed te begrijpen voordat je begint met schrijven. Op basis van alle antwoorden schrijf je één lopend verhaal in de "je"-vorm, zodat de melkveehouder zichzelf herkent en het voelt alsof je zijn of haar eigen verhaal rustig aan hem of haar terugvertelt.

Schrijf in het Nederlands, in begrijpelijke taal (niveau B1/B2), met korte en duidelijke zinnen. Gebruik de tweede persoon enkelvoud ("je/jij"), alsof je de melkveehouder direct aanspreekt. De toon is betrokken, begripvol en neutraal. Je geeft geen oordeel en geen advies.

Geef extra gewicht aan de open tekstantwoorden: gebruik die als ruggengraat van het verhaal en vul ze alleen aan met informatie uit de meerkeuze-antwoorden. Laat antwoorden met hoge scores (ongeveer 6–7 op de schaal) duidelijker terugkomen in de tekst, door in gewone taal te beschrijven waar de melkveehouder sterk of positief in is of juist veel vertrouwen in heeft. Noem de cijfers zelf nooit.

De samenvatting heeft altijd precies deze vier koppen, in deze volgorde, gevolgd door één korte alinea per kop. Zorg dat de alinea's logisch op elkaar aansluiten, zodat het voelt als één samenhangend, persoonlijk verhaal.

**Jouw bedrijf en huidige situatie**
Beschrijf in één lopende alinea hoe het bedrijf en de huidige situatie eruitzien. Gebruik waar mogelijk de eigen woorden of accenten uit de antwoorden. Benoem bijvoorbeeld het type bedrijf, de dagelijkse praktijk, hoe het nu ongeveer gaat en welke zaken al goed of stabiel voelen, zonder cijfers te noemen.

**Belangrijkste uitdagingen en zorgen**
Beschrijf in één lopende alinea de belangrijkste uitdagingen, knelpunten en zorgen die nu spelen. Dit kan gaan over werkdruk, regelgeving, omgeving, gezin, dieren, financiën of andere thema's die de melkveehouder aanstipt. Laat duidelijk worden wat echt op je drukt, maar overdrijf niets en verzin geen extra problemen.

**Hoe je naar de toekomst kijkt**
Beschrijf in één lopende alinea hoe je naar de toekomst kijkt: welke verwachtingen, hoop en twijfels je hebt en welke veranderingen je overweegt of ziet aankomen. Geef in gewone taal weer hoe zeker of onzeker je je voelt en hoe open je staat voor verandering of ondersteuning. Laat sterke positieve antwoorden extra terugkomen, bijvoorbeeld door te benoemen dat je ergens veel vertrouwen of energie in hebt.

**Wat voor jou het meest belangrijk is**
Beschrijf in één lopende alinea wat voor jou het meest belangrijk is om verder te kunnen met je bedrijf: welke steun, richting of duidelijkheid je helpt, wat belangrijk is voor je inkomen en hoe je naar de continuïteit van je bedrijf kijkt. Sluit af op een rustige en herkenbare manier, zonder aanbevelingen of plannen van jouw kant.

Gebruik uitsluitend informatie uit de vragenlijst. Neem geen namen, bedrijfsnamen, locaties of andere herleidbare gegevens op. Verzín nooit informatie of details die niet in de antwoorden staan en trek geen vergaande conclusies. Neem alle relevante antwoorden mee die inhoud hebben, vooral de open teksten. De tekst is tussen 180 en 400 woorden. Geef alleen de samenvatting, zonder extra toelichting of meta-uitleg.`;

export const DEMO_SUMMARY = `Dit is een **demoversie** van de samenvatting. Zet \`OPENAI_API_KEY\` in \`.env.local\` om een echte samenvatting op basis van je antwoorden te genereren.

Je antwoorden zijn lokaal opgeslagen. Met een geldige API-key wordt hier een persoonlijke, lopende samenvatting gegenereerd. Gebruik deze demo om de flow te testen.`;

export async function generateUniveSummaryFromFormData(rawFormData: unknown): Promise<string> {
  const formData = normalizeFormData(rawFormData);
  ensureNoPiiInFormData(formData);

  const client = getClient();
  if (!client) {
    return DEMO_SUMMARY;
  }

  const model = process.env.OPENAI_SUMMARIZE_MODEL ?? DEFAULT_MODEL;
  const userPrompt = buildUniveSummaryInput(formData);
  return await createSummary(client, model, UNIVE_SYSTEM_PROMPT, userPrompt);
}

export async function reviseUniveSummary(currentSummary: string, feedback: string): Promise<string> {
  const client = getClient();
  if (!client) {
    return currentSummary;
  }
  const model = process.env.OPENAI_SUMMARIZE_MODEL ?? DEFAULT_MODEL;
  const revisePrompt = `Huidige samenvatting:\n\n${currentSummary}\n\nFeedback van de melkveehouder (wat zij willen aanpassen):\n${feedback}\n\nGeef de herziene samenvatting in dezelfde structuur (inleiding, ## Kernpunten met bullets, ## Voor het gesprek).`;
  return await createSummary(client, model, REVISE_SYSTEM_PROMPT, revisePrompt);
}

export function normalizeUniveFormData(rawFormData: unknown): UniveFormData {
  return normalizeFormData(rawFormData);
}

