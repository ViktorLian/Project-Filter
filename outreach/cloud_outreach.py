"""
cloud_outreach.py – kjøres av GitHub Actions kl 09:00 daglig
Finner norske SMB-leads via BRREG + nettsider og sender FlowPilot-pitch.
Ingen lokal PC nødvendig.
"""
import os, json, random, time, re, smtplib, ssl, logging, sys
import urllib.request, urllib.parse, urllib.error
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formatdate, formataddr

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

# ── Credentials fra GitHub Secrets ───────────────────────────────────────────
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
    "rørlegger", "elektriker", "snekker", "tømrer", "maler", "taklegger",
    "glassmester", "låsesmed", "byggmester", "vvs", "murermester",
    "flislegger", "gulvlegger", "stillasbygger",
    "bilmekaniker", "bilverksted", "bilskade", "dekkskift",
    "budbil", "flyttebyrå",
    "tannlege", "fysioterapeut", "kiropraktor", "optiker", "hudpleie",
    "psykolog", "ergoterapeut", "fotterapeut", "personlig trener",
    "advokat", "regnskapsfører", "revisor", "eiendomsmegler",
    "frisør", "negledesigner", "barberer", "massasjeterapeut",
    "renholdsfirma", "vaktmesterservice",
    "it-support", "fotograf", "kjøreskole",
    "veterinær", "dyreklinikk", "hundepasser",
    "alarm installasjon", "solcelleinstallatør",
]

NORSKE_BYER = [
    "Oslo", "Bergen", "Trondheim", "Stavanger", "Drammen",
    "Fredrikstad", "Tromsø", "Sandnes", "Kristiansand", "Bodø",
    "Ålesund", "Tønsberg", "Moss", "Haugesund", "Porsgrunn",
    "Skien", "Sarpsborg", "Arendal", "Lillestrøm", "Hamar",
    "Gjøvik", "Kongsberg", "Molde", "Harstad", "Narvik",
    "Ski", "Elverum", "Lillehammer", "Halden", "Larvik",
    "Sandefjord", "Horten", "Stord", "Askøy", "Farsund",
]

_FAKE_LOCAL = {
    "email", "name", "navn", "test", "noreply", "no-reply", "info", "bruker",
    "kundeservice", "customer", "support", "hjelp", "kontaktskjema",
    "booking", "post", "firmapost", "kontor", "webmaster", "admin",
    "privacy", "legal", "media", "press", "sales", "marketing",
}
_EMAIL_RX  = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", re.I)
_SKIP_DOMS = {"sentry.io","facebook.com","example.com","test.com","wix.com",
              "wordpress.com","google.com","instagram.com","linkedin.com"}

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "no,en;q=0.5",
}

# ── Verktøy ──────────────────────────────────────────────────────────────────
def _fetch(url: str, timeout: int = 8) -> str:
    """Henter URL og returnerer HTML-tekst, eller tom streng."""
    if not url.startswith("http"):
        url = "https://" + url.lstrip("/")
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout) as r:
            raw = r.read(200_000)  # maks 200 kB
            charset = r.headers.get_content_charset("utf-8") or "utf-8"
            return raw.decode(charset, errors="replace")
    except Exception:
        return ""

def _emails_from_html(html: str, own_domain: str = "") -> list[str]:
    """Finner alle gyldige e-poster i HTML, filtrert."""
    found = []
    for m in _EMAIL_RX.finditer(html):
        e = m.group(0).lower()
        local, domain = (e.split("@") + [""])[:2]
        if domain in _SKIP_DOMS:
            continue
        if any(x in domain for x in (".png",".jpg",".gif",".svg",".css")):
            continue
        tld = domain.rsplit(".", 1)[-1]
        if tld not in ("no","com","org","net","io","co","biz","as"):
            continue
        if local in _FAKE_LOCAL:
            continue
        # Foretrekk samme domene som nettside
        if own_domain and domain == own_domain:
            found.insert(0, e)
        else:
            found.append(e)
    return found

def _best_email(html: str, domain: str = "") -> str:
    emails = _emails_from_html(html, domain)
    # Foretrekk spesifikke lokale deler over generiske
    preferred = ["post","kontakt","hei","daglig","leder","eier","marius","jon",
                 "ole","per","lars","anders","erik","thomas","henrik"]
    for e in emails:
        local = e.split("@")[0]
        if any(p in local for p in preferred):
            return e
    return emails[0] if emails else ""

def _scrape_site_email(url: str) -> str:
    """Prøver hjemmesiden + /kontakt + /contact etter e-poster."""
    if not url:
        return ""
    if not url.startswith("http"):
        url = "https://" + url.lstrip("/")
    domain = urllib.parse.urlparse(url).netloc.lstrip("www.")
    for path in ["", "/kontakt", "/contact", "/om-oss", "/about"]:
        html = _fetch(url.rstrip("/") + path)
        if html:
            email = _best_email(html, domain)
            if email:
                return email
        time.sleep(0.2)
    return ""

def _proff_email(name: str, orgnr: str) -> str:
    """Prøver proff.no som backup."""
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:60]
    html = _fetch(f"https://www.proff.no/selskap/{slug}/{orgnr}/")
    return _best_email(html) if html else ""

# ── BRREG lead-finder ────────────────────────────────────────────────────────
def _brreg_leads(max_leads: int = 600) -> list[dict]:
    leads   = []
    seen_orgs = set()
    bransjer  = BRANSJER[:]
    random.shuffle(bransjer)

    for bransje in bransjer:
        if len(leads) >= max_leads:
            break
        byer = random.sample(NORSKE_BYER, min(5, len(NORSKE_BYER)))
        for by in byer:
            if len(leads) >= max_leads:
                break
            q   = urllib.parse.quote(f"{bransje} {by}")
            url = (f"https://data.brreg.no/enhetsregisteret/api/enheter"
                   f"?navn={q}&size=20&konkurs=false")
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "FlowPilot/1.0"})
                with urllib.request.urlopen(req, timeout=10) as r:
                    data = json.loads(r.read().decode())
            except Exception as e:
                log.debug(f"BRREG {bransje}/{by}: {e}")
                continue

            for enh in (data.get("_embedded", {}).get("enheter") or []):
                if len(leads) >= max_leads:
                    break
                org  = enh.get("organisasjonsnummer", "")
                name = enh.get("navn", "").strip()
                if not org or not name or org in seen_orgs:
                    continue
                seen_orgs.add(org)

                komm = (enh.get("forretningsadresse") or {}).get("poststed", by)
                site = enh.get("hjemmeside", "") or ""
                if site and not site.startswith("http"):
                    site = "https://" + site

                email = ""
                # 1. Bedriftens egen nettside (mest pålitelig)
                if site:
                    email = _scrape_site_email(site)
                # 2. Proff.no
                if not email:
                    email = _proff_email(name, org)
                # 3. Konstruer vanlige adresser fra nettsteddomenet
                if not email and site:
                    dom = urllib.parse.urlparse(site).netloc.lstrip("www.")
                    if dom and "." in dom:
                        for prefix in ("post", "kontakt", "hei"):
                            candidate = f"{prefix}@{dom}"
                            email = candidate
                            break  # ta første, verifisering skjer i SMTP

                if email and _EMAIL_RX.match(email):
                    leads.append({
                        "company": name, "email": email.lower(),
                        "branch": bransje, "city": komm,
                    })
                    log.debug(f"Lead: {name} <{email}>")

            time.sleep(0.4)

    log.info(f"BRREG-søk ferdig: {len(leads)} leads med e-post funnet")
    return leads

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
    if not entry or not isinstance(entry, dict):
        return False
    return bool(entry.get("negative_reply") or entry.get("bounced"))

def already_sent(email: str, sent: dict) -> bool:
    return email.lower() in sent

# ── E-post templates (5 varianter – SEO, Maps, AI/GEO, nettside) ─────────────
def _build_email(company: str, branch: str, city: str) -> tuple[str, str]:
    sokeord = f"{branch} {city}".strip()
    templates = [
        (
            f"Søkte etter {branch} i {city} – fant ikke {company} øverst",
            f"Hei,\n\n"
            f"Jeg søkte på '{sokeord}' i dag og la merke til at {company} ikke dukker opp "
            f"blant de tre øverste resultatene. De fleste kunder klikker aldri lenger ned enn topp 3.\n\n"
            f"FlowPilot publiserer ett SEO-optimalisert innlegg på nettsiden din hver dag – automatisk. "
            f"Over tid bygger dette en Google-tilstedeværelse konkurrentene dine sliter med å ta igjen.\n\n"
            f"Vi setter alt opp og driver det for deg. Du gjør ingenting.\n\n"
            f"Første 30 dager gratis – ingen binding. Book et kvarters prat på flowpilot.no, "
            f"eller svar direkte på denne e-posten.\n\n{SIGNATUR}"
        ),
        (
            f"{company} – én konkurrent tar kundene dine akkurat nå",
            f"Hei,\n\n"
            f"Bedrifter som ligger øverst på Google Maps for '{sokeord}' får 3 av 4 klikk. "
            f"De som ikke er synlige der, eksisterer ikke for de fleste kunder.\n\n"
            f"Vi optimaliserer Google Maps-profilen din, henter inn anmeldelser og sørger for "
            f"at du holder topp-plassering lokalt. Alt skjer automatisk.\n\n"
            f"Første måned er gratis. Svar på denne e-posten eller book på flowpilot.no.\n\n{SIGNATUR}"
        ),
        (
            f"Stadig flere finner {branch} via ChatGPT – er {company} synlig der?",
            f"Hei,\n\n"
            f"En ny trend endrer hvordan kunder finner lokale bedrifter: de spør ChatGPT og "
            f"Google AI i stedet for å søke tradisjonelt.\n\n"
            f"Vi bygger AI-synlighet for {company} – slik at når noen spør 'hvem er best på "
            f"{branch} i {city}', er det dere som nevnes. Dette gjør svært få norske bedrifter ennå.\n\n"
            f"Kombiner dette med daglig SEO-innhold og Google Maps, og du har en markedsmotor "
            f"som jobber 24 timer i døgnet.\n\n"
            f"30 dager gratis. Book 15 minutter på flowpilot.no eller svar direkte.\n\n{SIGNATUR}"
        ),
        (
            f"Hvordan {branch}-bedrifter vokser 7× raskere på nett",
            f"Hei,\n\n"
            f"Bedrifter med aktiv blogg og SEO-innhold får 7 ganger mer organisk trafikk "
            f"enn konkurrenter uten. FlowPilot gjør dette automatisk – ett innlegg publisert "
            f"daglig, tilpasset {branch} og {city}.\n\n"
            f"I tillegg: Google Maps-optimalisering, AI-merkevaresynlighet og CRM. "
            f"Vi driver alt – du fokuserer på jobben.\n\n"
            f"Første 30 dager gratis, ingen binding. flowpilot.no eller svar her.\n\n{SIGNATUR}"
        ),
        (
            f"Nettside + SEO + Google Maps for {company} – alt på autopilot",
            f"Hei,\n\n"
            f"Tre ting avgjør om en lokal {branch}-bedrift vinner på nett:\n"
            f"1. Daglig SEO-innhold som Google elsker\n"
            f"2. Topp plassering på Google Maps\n"
            f"3. Synlighet i AI-søk (ChatGPT, Perplexity)\n\n"
            f"FlowPilot leverer alle tre – vi setter det opp og driver det for deg. "
            f"{company} kan ha dette på plass innen 48 timer.\n\n"
            f"Første måned gratis. Book på flowpilot.no eller svar direkte.\n\n{SIGNATUR}"
        ),
    ]
    return random.choice(templates)

# ── Send e-post via SMTP ──────────────────────────────────────────────────────
def send_email(to_email: str, subject: str, body: str) -> tuple[bool, str]:
    if not FROM_EMAIL or not FROM_PASS:
        return False, "Ingen SMTP-legitimasjon"
    try:
        msg = MIMEMultipart("alternative")
        msg["From"]    = formataddr((FROM_NAME, FROM_EMAIL))
        msg["To"]      = to_email
        msg["Subject"] = subject
        msg["Date"]    = formatdate(localtime=True)
        footer = "\n\n---\nFor å avmelde deg svar med 'avmeld'."
        msg.attach(MIMEText(body + footer, "plain", "utf-8"))
        ctx = ssl.create_default_context()
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=25) as s:
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

    log.info("Henter leads fra BRREG (inkl. nettsider)...")
    leads = _brreg_leads(max_leads=800)
    random.shuffle(leads)

    if not leads:
        log.error("Ingen leads funnet – sjekk BRREG-tilkobling")
        sys.exit(1)

    stats = {"sent": 0, "skipped": 0, "failed": 0}

    for lead in leads:
        if stats["sent"] >= MAX_SEND:
            break

        email   = lead.get("email", "").lower().strip()
        company = lead.get("company", "?")
        branch  = lead.get("branch", "")
        city    = lead.get("city", "")

        if not email or "@" not in email:
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
                time.sleep(random.uniform(12, 22))
        else:
            stats["failed"] += 1
            log.warning(f"  FEIL  {company} <{email}>: {msg_out}")

    save_sent(sent)
    log.info(
        f"=== Ferdig: sendt={stats['sent']} "
        f"hoppet={stats['skipped']} feilet={stats['failed']} ==="
    )
    if stats["sent"] == 0:
        log.error("0 emails sendt! Sjekk leads-finn og SMTP.")
        sys.exit(1)  # trigger GitHub Actions failure alert

if __name__ == "__main__":
    main()
