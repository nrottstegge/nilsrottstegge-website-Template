# Editierbares Portfolio: Jekyll + Decap

Das Design der bestehenden Website ist als Jekyll-Template übernommen: animierte
Startseite, Projektseiten, Bilder, Videoloops, interaktive Grafiken und CV.
Decap stellt die deutschen Formulare für Texte, Projekte, Medien und PDF bereit.
Browser-JavaScript liegt direkt in `assets/js/`; ein Astro-Build ist nicht nötig.

## Zwei Betriebswege

| | Öffentliche Vorführung | Uni-Betrieb |
|---|---|---|
| Quellcode | GitHub | GitLab der Universität |
| Website | GitHub Pages (`github.io`) | Interner Webserver hinter HAProxy |
| Redaktion | `/admin/`, Login ohne Konto | `/admin/`, persönliches GitLab-Konto |
| CMS-Backend | `test-repo`, nur Browser-Arbeitsspeicher | GitLab mit OAuth Authorization Code + PKCE |
| Speichern im CMS | Keine Änderung an Dateien oder Website | Entwurf/Commit bzw. Merge Request im GitLab-Projekt |
| Veröffentlichung | Git-Push nach `main` | Freigabe/Merge auf den geschützten Defaultbranch |
| Pipeline | GitHub Actions → Jekyll → Pages | GitLab CI → Jekyll → interner Deploy-Runner |

**Eine Demo-Änderung löst keine Pipeline aus.** Ohne Konto wird ausschließlich
Bedienung und Vorschau getestet. Der echte Demo-Build wird durch Git-Push
getestet. GitLab-Anmeldung, Uni-Runner und HAProxy bleiben Teil der separaten
Uni-Installation; GitHub Pages simuliert diese Infrastruktur nicht.

## GitHub-Pages-Demo

Repository: [nrottstegge/nilsrottstegge-website-Template](https://github.com/nrottstegge/nilsrottstegge-website-Template)

Nach erfolgreichem Pages-Deployment:

- Website: <https://nrottstegge.github.io/nilsrottstegge-website-Template/>
- Redaktion: <https://nrottstegge.github.io/nilsrottstegge-website-Template/admin/>

In der Redaktion **Login** anklicken. Es werden weder GitHub/GitLab-Konto noch
Passwort benötigt. Die vorhandenen Inhalte werden in den Browser kopiert.
Bearbeiten, neue Projekte und Uploads ausprobieren; beim Neuladen werden alle
Demo-Änderungen verworfen. Die Vorschau im Editor zeigt Änderungen, ein zweiter
Website-Tab weiterhin den zuletzt veröffentlichten Jekyll-Build.

### Einmalig einrichten

1. Dieses Projekt in das GitHub-Repository mit Branch `main` pushen.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions** wählen.
3. Den Workflow **GitHub Pages demo** unter **Actions** starten oder erneut nach
   `main` pushen. Pages muss aktiviert sein, bevor der Workflow seine URL liest.
4. Der erfolgreiche Deploy-Job zeigt die tatsächliche Website-Adresse.

Für ein anderes Repository sind keine fest codierten Build-Pfade zu ändern:
Der Workflow liest die Pages-Adresse aus GitHub aus, einschließlich Unterpfad.
`template.config.json` enthält weiterhin nur die Einstellungen für den Uni-Betrieb.
Es werden keine OAuth-Secrets, persönlichen Tokens oder zusätzlichen Services
für die öffentliche Demo benötigt.

### Pipeline auf GitHub

Datei: [`.github/workflows/demo.yml`](.github/workflows/demo.yml).
Auslöser: Push auf `main` oder manueller Start (`workflow_dispatch`).

| Job/Schritt | Eingabe und Ergebnis |
|---|---|
| `build`: Checkout, Node 22, Ruby 3.3/Bundler | Repository und Gems aus `Gemfile.lock` |
| `npm run seed && npm run check && npm test` | Aktuelle Demo-Inhalte, Konfigurations-/Integritätsprüfung und Tests |
| `actions/configure-pages` | Tatsächliche Pages-URL als `base_url` |
| `configure.mjs --demo-url …` | Temporäres `_config.demo.yml`, CMS mit `test-repo`, CSP ohne externe API |
| Jekyll mit `_config.yml,_config.demo.yml` | `_site/` mit korrektem Domain-/Repository-Pfad und aktivierter Demo unter `/admin/` |
| `check-build.mjs _config.demo.yml` | Prüft Seiten, interne Links, Medienpfade und die Isolation der Demo |
| `upload-pages-artifact` | Übergibt ausschließlich `_site/` als Artefakt `github-pages` |
| `deploy` | Wartet auf `build`, veröffentlicht das Artefakt und liefert die Pages-URL |

Der Build hat Lesezugriff auf Inhalte und Pages-Metadaten. Nur der Deploy-Job
bekommt `pages: write` und `id-token: write`. Das Environment heißt
`github-pages`; parallele Veröffentlichungen werden serialisiert. Es gibt
keinen Commit aus dem Workflow zurück ins Repository.

### Pipeline nachvollziehbar testen

1. Beispielsweise `_data/home.json` in Git ändern und nach `main` pushen.
2. Unter **Actions → GitHub Pages demo** den Build und danach `deploy` verfolgen.
3. Nach erfolgreichem Deployment die Website neu laden: Der geänderte Text muss
   sichtbar sein. Bei einem Fehler wird kein neues Artefakt veröffentlicht.
4. Im Demo-Editor einen anderen Text speichern: Er ist nur in der Redaktion
   geändert. Nach Neuladen verschwindet diese Änderung; es entsteht kein neuer
   Actions-Lauf.

## Produktive Architektur der Universität

```text
Redakteure → https://website.ch/admin/ → Decap im Browser
                                           ↕ OAuth + PKCE
                                    GitLab der Universität
                                           ↓ Commit / Merge Request
                                       GitLab CI/CD
                                           ↓ Build-Runner führt Jekyll aus
                                        Artefakt _site/
                                           ↓ geschützter Deploy-Runner
                                     interner Webserver
                                           ↕ HTTPS mit Zertifikatsprüfung
                                         HAProxy
                                           ↕ HTTPS
                                         Besucher
```

Der Runner fragt GitLab nach Jobs ab. Der Webserver selbst klont kein Repository
und führt keinen periodischen `git pull` aus. Die Browser der Autoren müssen
GitLab-OAuth und die API erreichen können, gegebenenfalls über das Uni-VPN.
Öffentliche Besucher benötigen keinen GitLab-Zugang.

### Pipeline auf GitLab

Datei: [`.gitlab-ci.yml`](.gitlab-ci.yml).
Branches und Merge Requests werden geprüft; zusätzliche Branch-Pipelines bei
bereits offenem Merge Request werden unterdrückt. Tags lösen keine Pipeline aus.

| Job | Ausführung und Übergabe |
|---|---|
| `validate` | Node 22: Demo-Inhalte erzeugen, echte Uni-Konfiguration prüfen (`--production`), Tests. Übergibt `admin/demo/seed.json`. |
| `build` | Ruby 3.3: lädt das Seed-Artefakt, installiert die Gems, baut mit `JEKYLL_ENV=production`. Übergibt `_site/`. |
| `verify` | Node 22: lädt `_site/`, prüft Links, Medien und den Ausschluss von Quell-/Serverdateien. |
| `deploy` | Wartet auf `build` und `verify`; läuft nur auf dem geschützten Defaultbranch und Runner mit Tag `website-deploy`. |

Deployments verwenden `resource_group: website-production`. Das Skript
`scripts/deploy-release.sh` kopiert das Build-Artefakt nach
`$DEPLOY_ROOT/releases/COMMIT-PIPELINE/` und wechselt den Link `current` atomar.
Nginx liefert `current` aus. Alte Releases werden nicht automatisch gelöscht.
Merge Requests erhalten keinen Produktions-Deploy. Die Artefakte bleiben eine
Woche verfügbar; `vendor/bundle/` dient nur als Gem-Cache.

### Uni-Konfiguration

`template.config.json` mit Projektpfad, Branch, Website-URL, Uni-GitLab-URL und
Application ID füllen, danach `npm run configure` ausführen. Es synchronisiert
`_config.yml`, `admin/config.yml` und die CSP. **Kein Client Secret eintragen.**
Die OAuth-App ist ein öffentlicher Client (Confidential aus) mit Scope `api` und
exakter Redirect-URI `https://website.ch/admin/`.

Uni-IT richtet Autorenrechte, geschützten Branch, Runner, DNS und Zertifikate
ein. Der Deploy-Runner benötigt die geschützte Variable `DEPLOY_ROOT` sowie
`PUBLIC_SITE_URL` für den Environment-Link. Details:
[Einrichtung](docs/EINRICHTUNG.md), [Sicherheit](docs/SICHERHEIT.md).
Die Beispiele unter `deploy/` sind Serverkonfigurationen, kein laufendes Hosting.

## Lokal arbeiten

Voraussetzungen: Node 22.18 oder neuer, Ruby 3.3 und Bundler. Keine npm-Pakete
müssen installiert werden; Decap ist lokal versioniert enthalten.

```sh
bundle install
npm run configure
npm run build
npm run demo
```

Website: <http://127.0.0.1:4000/>. Lokale Redaktion ohne Konto:
<http://127.0.0.1:4000/admin/demo/>. Der Server bindet nur an Loopback.
Im Uni-Produktionsbuild ist diese Demo standardmäßig abgeschaltet.

Den Pages-Unterpfad lokal wie in Actions prüfen:

```sh
npm run seed
npm run check
npm test
node scripts/configure.mjs --demo-url https://nrottstegge.github.io/nilsrottstegge-website-Template
JEKYLL_ENV=production bundle exec jekyll build --config _config.yml,_config.demo.yml
node scripts/check-build.mjs _config.demo.yml
npm run demo -- _config.demo.yml
```

Danach wieder `npm run configure` für die Uni-/Standardkonfiguration ausführen.
`_site/`, `_config.demo.yml` und der erzeugte Demo-Seed werden nicht eingecheckt.
JavaScript wird direkt gepflegt; `seed` erzeugt ausschließlich Demo-Inhalte.

## Inhalt und Sicherheit

Die Beispiele enthalten noch die ursprünglichen Portfolio-Texte, Bilder und den
CV. Für einen Kunden diese Inhalte, Bildrechte und Rechtstexte anpassen.
Die vorhandenen interaktiven Grafiken sind bedienbar; neue Grafiktypen benötigen
weiterhin Code. Autorenanleitung: [docs/REDAKTION.md](docs/REDAKTION.md).

Für den Uni-Betrieb sind HTTPS außen **und innen**, geprüfte Zertifikate,
persönliche Konten sowie GitLab-Rechte vorgesehen. PKCE begrenzt den benötigten
`api`-Scope nicht auf ein einzelnes Projekt. Tokens liegen im Redaktionsbrowser.
Decaps Schema-Prüfung benötigt `unsafe-eval` auf den CMS-Seiten. Diese Grenzen
und die noch erforderliche Live-Abnahme stehen in der Sicherheitsdokumentation.

Quellen: [GitHub Pages-Workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages),
[Decap Test-Backend](https://decapcms.org/docs/test-backend/),
[Decap GitLab-PKCE](https://decapcms.org/docs/gitlab-backend/).
