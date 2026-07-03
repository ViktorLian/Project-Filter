"""
cloud_outreach.py – kjøres av GitHub Actions kl 09:00 daglig
Finner norske SMB-leads via BRREG og sender FlowPilot-pitchemail.
Ingen lokal PC nødvendig.
"""
import os, json, random, time, re, smtplib, ssl, logging, sys
from datetime import datetime, date
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formatdate, formataddr

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

# ── Credentials fra GitHub Secrets (environment variables) ───────────────────
SMTP_HOST  = os.environ.get("EMAIL_SMTP_HOST", "smtp.gmail.com")
SMTP_PORT  = int(os.environ.get("EMAIL_SMTP_PORT", "587"))
FROM_EMAIL = os.environ.get("EMAIL_FLOWPILOT", "")
FROM_PASS  = os.environ.get("EMAIL_FLOWPILOT_PASS", "")
FROM_NAME  = "Viktor Lian | FlowPilot"
SIGNATUR   = "Med vennlig hilsen,\nViktor Lian\nFlowPilot | flowpilot.no | Tlf: 414 26 005"

SENT_FILE  = os.path.join(os.path.dirname(__file__), "sent_emails.json")
MAX_SEND   = 200

# ── Alle SMB-nisjer som trenger Google-synlighet ─────────────────────────────
BRANSJER = [
    # Håndverk og bygg
    "rørlegger", "elektriker", "snekker", "tømrer", "maler", "taklegger",
    "glassmester", "låsesmed", "byggmester", "vvs firma", "murermester",
    "flislegger", "gulvlegger", "taktekker", "isolatør", "stillasbygger",
    # Bil og transport
    "bilmekaniker", "bilverksted", "bilskade", "dekkskift", "biltilbehør",
    "budbil", "flyttebyrå", "taxiselskap",
    # Helse og velvære
    "tannlege", "fysioterapeut", "kiropraktor", "optiker", "hudpleie",
    "psykolog", "logoped", "ergoterapeut", "naprapat", "akupunktør",
    "fotterapeut", "personlig trener", "treningssenter", "yogastudio",
    # Profesjonelle tjenester
    "advokat", "regnskapsfører", "revisor", "eiendomsmegler",
    "forsikringsmegler", "finansrådgiver", "inkassoselskap",
    # Skjønnhet og velvære
    "frisør", "negledesigner", "tatoveringsstudio", "barberer",
    "massasjeterapeut", "solstudio",
    # Renholds og vedlikehold
    "renholdsfirma", "vaktmesterservice", "skadedyrkontroll",
    "vinduspussing", "snørydding",
    # Mat og drikke
    "cateringselskap", "matlevering", "kafé",
    # Teknologi og media
    "it-support", "nettsteddesign", "fotograf", "videoproduksjon",
    # Utdanning og omsorg
    "barnehage privat", "logopedtjeneste", "musikklærer", "kjøreskole",
    # Nisjer med sterk lokal konkurranse
    "hundefrisør", "veterinær", "dyreklinikk", "blomsterbutikk luksus",
    "låsesmed", "alarminstallasjon", "solcelleinstallatør",
]

NORSKE_BYER = [
    "Oslo", "Bergen", "Trondheim", "Stavanger", "Drammen",
    "Fredrikstad", "Tromsø", "Sandnes", "Kristiansand", "Bodø",
    "Ålesund", "Tønsberg", "Moss", "Haugesund", "Porsgrunn",
    "Skien", "Sarpsborg", "Arendal", "Lillestrøm", "Hamar",
    "Gjøvik", "Kongsberg", "Molde", "Harstad", "Narvik",
    "Askøy", "Ringerike", "Ski", "Ås", "Elverum",
    "Lillehammer", "Halden", "Larvik", "Sandefjord", "Horten",
]

_FAKE_LOCAL = {
    "email", "name", "navn", "test", "noreply", "no-reply", "info", "bruker",
    "kundeservice", "customer", "support", "hjelp", "kontaktskjema",
    "booking", "post", "firmapost", "kontor",
}
_EMAIL_RX = re.compile(r"[\w.\-+]+@[\w.\-]+\.[a-z]{2,}", re.IGNORECASE)

# ── Laster/lagrer sendt-logg ─────────────────────────────────────────────────
def load_sent() -> dict:
    if os.path.exists(SENT_FILE):
        with open(SENT_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def save_sent(log_data: dict) -> None:
    with open(SENT_FILE, "w", encoding="utf-8") as f:
        json.dump(log_data, f, ensure_ascii=False, indent=2)

def is_blocked(email: str, sent: dict) -> bool:
    entry = sent.get(email.lower())
    if not entry:
        return False
    if isinstance(entry, dict):
        return entry.get("negative_reply") or entry.get("bounced")
    return False

def already_sent(email: str, sent: dict) -> bool:
    return email.lower() in sent

# ── BRREG lead-finder ────────────────────────────────────────────────────────
def _brreg_leads(max_leads: int = 300) -> list[dict]:
    import urllib.request, urllib.parse
    leads = []
    random.shuffle(BRANSJER)
    for bransje in BRANSJER:
        if len(leads) >= max_leads:
            break
        for by in random.sample(NORSKE_BYER, min(4, len(NORSKE_BYER))):
            if len(leads) >= max_leads:
                break
            query = urllib.parse.quote(f"{bransje} {by}")
            url = f"https://data.brreg.no/enhetsregisteret/api/enheter?navn={query}&size=10"
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "FlowPilot/1.0"})
                with urllib.request.urlopen(req, timeout=8) as resp:
                    data = json.loads(resp.read().decode())
                for enh in (data.get("_embedded", {}).get("enheter") or []):
                    name  = enh.get("navn", "").strip()
                    org   = enh.get("organisasjonsnummer", "")
                    komm  = (enh.get("forretningsadresse") or {}).get("poststed", by)
                    if not name or not org:
                        continue
                    # Prøv å finne email via proff.no (enkel scraping)
                    email = _try_proff_email(name, org)
                    if email:
                        leads.append({"company": name, "email": email,
                                      "branch": bransje, "city": komm})
            except Exception as e:
                log.debug(f"BRREG feil ({bransje} {by}): {e}")
                continue
            time.sleep(0.3)
    return leads

def _try_proff_email(company: str, orgnr: str) -> str:
    """Prøver å finne e-post fra proff.no eller konstruere fra orgnr."""
    import urllib.request
    # Sjekk proff.no for kontaktinfo
    try:
        slug = re.sub(r"[^a-z0-9]+", "-", company.lower()).strip("-")
        url = f"https://www.proff.no/selskap/{slug}/{orgnr}/"
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        })
        with urllib.request.urlopen(req, timeout=6) as r:
            html = r.read().decode("utf-8", errors="replace")
        emails = _EMAIL_RX.findall(html)
        for email in emails:
            if _is_valid_email(email):
                return email.lower()
    except Exception:
        pass
    return ""

def _is_valid_email(email: str) -> bool:
    email = email.lower()
    if not _EMAIL_RX.match(email):
        return False
    local = email.split("@")[0]
    domain = email.split("@")[-1] if "@" in email else ""
    if local in _FAKE_LOCAL:
        return False
    if any(x in domain for x in ("facebook", "sentry", "example", "test", "noreply")):
        return False
    tld = domain.rsplit(".", 1)[-1]
    if tld not in ("no", "com", "org", "net", "io", "co", "biz"):
        return False
    return True

# ── E-post templates (5 varianter – SEO, Maps, AI/GEO, nettside) ─────────────
def _build_email(company: str, branch: str, city: str) -> tuple[str, str]:
    sokeord = f"{branch} {city}".strip()
    templates = [
        (
            f"Søkte etter {branch} i {city} – fant ikke {company} øverst",
            f"Hei,\n\n"
            f"Jeg søkte på '{sokeord}' i dag og la merke til at {company} ikke dukker opp blant de tre øverste resultatene. "
            f"De fleste kunder klikker aldri lenger ned enn topp 3.\n\n"
            f"FlowPilot publiserer ett SEO-optimalisert innlegg på nettsiden din hver eneste dag – automatisk. "
            f"Over tid bygger dette en Google-tilstedeværelse konkurrentene dine sliter med å matche.\n\n"
            f"Vi setter alt opp og driver det for deg. Du gjør ingenting.\n\n"
            f"Første 30 dager gratis. Book et kvarters prat på flowpilot.no, eller svar direkte hit.\n\n{SIGNATUR}"
        ),
        (
            f"{company} – én konkurrent i {city} tar kundene dine akkurat nå",
            f"Hei,\n\n"
            f"Bedrifter som ligger øverst på Google Maps for '{sokeord}' får 3 av 4 klikk. "
            f"De som ikke er synlige der, eksisterer ikke for de fleste kunder.\n\n"
            f"Vi optimaliserer Google Maps-profilen din, henter inn anmeldelser og sørger for at du ligger øverst lokalt. "
            f"Alt skjer automatisk – ingen tid nødvendig fra din side.\n\n"
            f"Første måned er gratis. Svar på denne e-posten eller book direkte på flowpilot.no.\n\n{SIGNATUR}"
        ),
        (
            f"Stadig flere finner {branch} via ChatGPT – er {company} synlig der?",
            f"Hei,\n\n"
            f"En ny trend endrer hvordan kunder finner lokale bedrifter: de spør ChatGPT, Perplexity og Google AI "
            f"i stedet for å søke tradisjonelt.\n\n"
            f"Vi bygger AI-synlighet for {company} – slik at når noen spør 'hvem er best på {branch} i {city}', "
            f"er det dere som nevnes. Dette er noe svært få norske bedrifter gjør ennå.\n\n"
            f"Kombiner dette med daglig SEO-innhold og Google Maps-optimalisering, og du har en markedsmotor "
            f"som jobber 24 timer i døgnet.\n\n"
            f"30 dager gratis. Book 15 minutter på flowpilot.no eller svar hit.\n\n{SIGNATUR}"
        ),
        (
            f"Hvordan {branch}-bedrifter i {city} vokser 7× raskere på nett",
            f"Hei,\n\n"
            f"HubSpot-data viser at bedrifter med aktiv blogg får 7 ganger mer organisk trafikk. "
            f"FlowPilot gjør dette automatisk – ett SEO-innlegg publisert daglig, tilpasset {branch} og {city}.\n\n"
            f"I tillegg: Google Maps-optimalisering, AI-merkevaresynlighet og CRM for å følge opp leads. "
            f"Alt i én pakke, vi driver alt – du fokuserer på jobben.\n\n"
            f"Første 30 dager er gratis, ingen binding.\n\n"
            f"Svar på denne e-posten eller book et møte på flowpilot.no.\n\n{SIGNATUR}"
        ),
        (
            f"Nettside + SEO + Maps for {company} – alt på autopilot",
            f"Hei,\n\n"
            f"Tre ting avgjør om en lokal {branch}-bedrift vinner på nett:\n"
            f"1. En rask nettside med daglig innhold\n"
            f"2. Topp plassering på Google Maps\n"
            f"3. Synlighet i AI-søk (ChatGPT, Perplexity)\n\n"
            f"FlowPilot leverer alt tre – vi setter det opp og driver det for deg. "
            f"{company} kan ha dette på plass innen 48 timer.\n\n"
            f"Første måned gratis. Book et møte på flowpilot.no eller svar direkte.\n\n{SIGNATUR}"
        ),
    ]
    return random.choice(templates)

# ── Send e-post via SMTP ──────────────────────────────────────────────────────
def send_email(to_email: str, subject: str, body: str) -> tuple[bool, str]:
    if not FROM_EMAIL or not FROM_PASS:
        return False, "Ingen SMTP-legitimasjon satt"
    try:
        msg = MIMEMultipart("alternative")
        msg["From"]    = formataddr((FROM_NAME, FROM_EMAIL))
        msg["To"]      = to_email
        msg["Subject"] = subject
        msg["Date"]    = formatdate(localtime=True)
        msg.attach(MIMEText(body + "\n\n---\nFor å avmelde deg, svar med 'avmeld'", "plain", "utf-8"))
        ctx = ssl.create_default_context()
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as s:
            s.ehlo()
            s.starttls(context=ctx)
            s.login(FROM_EMAIL, FROM_PASS)
            s.sendmail(FROM_EMAIL, to_email, msg.as_bytes())
        return True, "ok"
    except Exception as e:
        return False, str(e)

# ── Hovedfunksjon ────────────────────────────────────────────────────────────
def main():
    log.info("=== FlowPilot Cloud Outreach starter ===")
    if not FROM_EMAIL or not FROM_PASS:
        log.error("FEIL: EMAIL_FLOWPILOT og EMAIL_FLOWPILOT_PASS må settes som GitHub Secrets")
        sys.exit(1)

    sent = load_sent()
    log.info(f"Tidligere sendt: {len(sent)} emails")

    log.info("Henter leads fra BRREG...")
    leads = _brreg_leads(max_leads=600)
    random.shuffle(leads)
    log.info(f"Fant {len(leads)} potensielle leads")

    stats = {"sent": 0, "skipped": 0, "failed": 0}

    for lead in leads:
        if stats["sent"] >= MAX_SEND:
            break

        email   = lead.get("email", "").lower()
        company = lead.get("company", "?")
        branch  = lead.get("branch", "")
        city    = lead.get("city", "")

        if not email or not _is_valid_email(email):
            stats["skipped"] += 1
            continue
        if already_sent(email, sent) or is_blocked(email, sent):
            stats["skipped"] += 1
            continue

        subject, body = _build_email(company, branch, city)
        ok, msg_out = send_email(email, subject, body)

        if ok:
            sent[email] = {
                "company": company, "branch": branch, "city": city,
                "sent_at": datetime.now().isoformat(), "seq_step": 1,
                "replied": False, "bounced": False, "negative_reply": False,
            }
            stats["sent"] += 1
            log.info(f"  OK  {company} <{email}>")
            if stats["sent"] < MAX_SEND:
                time.sleep(random.uniform(12, 25))
        else:
            stats["failed"] += 1
            log.warning(f"  FEIL {company} <{email}>: {msg_out}")

    save_sent(sent)
    log.info(f"=== Ferdig: sendt={stats['sent']} hoppet={stats['skipped']} feilet={stats['failed']} ===")
    if stats["sent"] == 0:
        log.warning("Ingen emails sendt – sjekk BRREG-forbindelsen og SMTP-credentials")

if __name__ == "__main__":
    main()
