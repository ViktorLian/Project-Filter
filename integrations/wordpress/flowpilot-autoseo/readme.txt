=== FlowPilot AutoSEO ===
Contributors: flowpilot
Tags: seo, automation, webhook, content
Requires at least: 6.0
Requires PHP: 8.0
Stable tag: 1.0.0
License: GPLv2 or later

Mottar signerte AutoSEO-artikler fra FlowPilot og oppretter dem som WordPress-utkast eller publiserte innlegg.

== Installasjon ==

1. Last opp ZIP-filen under Utvidelser -> Legg til ny -> Last opp utvidelse.
2. Aktiver FlowPilot AutoSEO.
3. Åpne Innstillinger -> FlowPilot AutoSEO.
4. Kopier webhook-adresse og webhook-hemmelighet til FlowPilot.
5. I FlowPilot velger du SEO og faginnhold -> Modus: Send via webhook.
6. Test med ett innlegg som WordPress-utkast før automatisk publisering aktiveres.

== Sikkerhet ==

Alle kall må ha en SHA-256 HMAC-signatur laget med den delte hemmeligheten. Duplikate slugs opprettes ikke på nytt.

== Changelog ==

= 1.0.0 =
* Første versjon.
