# Inbetriebnahme im Uni-Netz

Diese Anleitung betrifft den Uni-Betrieb. Die separate GitHub-Pages-Demo und
ihre Pipeline sind im [README](../README.md) beschrieben.

## 1. GitLab-Projekt und Adressen

Ein eigenes Projekt auf dem Uni-GitLab anlegen. Hauptbranch und CI-Defaultbranch
auf denselben Namen setzen, beispielsweise `main`. Der Projektpfad kann
Untergruppen enthalten. `template.config.json` mit den tatsächlichen Werten
füllen und ausführen:

```sh
npm run configure
npm run check -- --production
```

`gitlabUrl` ist eine HTTPS-Origin ohne Pfad oder abschließenden Schrägstrich.
GitLab-Installationen unter einem URL-Unterpfad sind in dieser Vorlage nicht
vorkonfiguriert. `siteUrl` darf einen Website-Unterpfad enthalten; die mitgelieferte
Serverkonfiguration geht von einer Website an der Domainwurzel aus.

Die Browser der Autoren müssen GitLabs `/oauth/authorize`, `/oauth/token` und
`/api/v4` erreichen können. Ein öffentlicher HAProxy vor der Website macht ein
internes GitLab nicht automatisch erreichbar. Für interne GitLab-Systeme muss
gegebenenfalls das Uni-VPN aktiv sein. Öffentliche Besucher brauchen keinen
GitLab-Zugang.

## 2. GitLab-OAuth-App für PKCE

Unter den Anwendungen des Betreiberkontos oder der GitLab-Gruppe eine
OAuth-Anwendung registrieren:

- Name: „Website-Redaktion“.
- Redirect URI: exakt `https://website.ch/admin/`, einschließlich Slash.
- **Confidential deaktivieren**: Die Browseranwendung ist ein öffentlicher Client.
- Scope **api** auswählen, wie von Decaps GitLab-Backend benötigt.
- Die erzeugte **Application ID** in `template.config.json` eintragen.

GitLab zeigt gegebenenfalls auch ein Client Secret an. Es wird beim PKCE-Flow
nicht verwendet und darf nicht in Browser-Code oder Repository gespeichert
werden. Danach `npm run configure` ausführen. Die Konfiguration verwendet
`name: gitlab`, `auth_type: pkce`, `app_id`, `api_root`, `base_url` und
`auth_endpoint: oauth/authorize`.

GitLab authentifiziert die Benutzer. Ein bestehendes Uni-SSO wird innerhalb des
GitLab-Logins genutzt, sofern die Uni es eingerichtet hat. PKCE ersetzt weder
2FA noch Repository-Autorisierung. Für `/admin` ist eine Weiterleitung auf
`/admin/` vorgesehen; die Rücksprungadresse muss mit der App übereinstimmen.

GitLab unterstützt CORS für den Token-Endpunkt. Reverse Proxies davor dürfen
CORS- und OPTIONS-Anfragen nicht blockieren. Falls die Uni-Installation davon
abweicht, muss die Uni-IT die tatsächliche Einstellung prüfen; keine globale
Freigabe beliebiger Origins nur zur Fehlerbehebung einrichten.

## 3. Autorenrechte und Freigabe

Autoren als individuelle Mitglieder des Website-Projekts einladen. Die Rechte
müssen das Bearbeiten von Inhalten und Erstellen der CMS-Branches erlauben,
üblicherweise mindestens Developer. GitLabs Defaultbranch ist normalerweise
geschützt. Die Uni-IT muss ausdrücklich festlegen, ob Autoren selbst auf `main`
veröffentlichen dürfen oder ein Maintainer den Merge Request freigibt.

Bei verpflichtender Freigabe:

- `main` geschützt lassen, direkte Pushes begrenzen.
- Review- und Merge-Berechtigungen über GitLab festlegen.
- Entwürfe in Decap speichern; einen Maintainer den Merge Request prüfen und
  zusammenführen lassen, wenn Decap nicht selbst mergen darf.
- Runner und Deployment-Variablen als geschützt konfigurieren.

Das Beispiel erteilt Autoren keine gemeinsamen Admin-Zugangsdaten. 2FA bzw.
Uni-SSO nach den Vorgaben der Universität verwenden. Beim Ausscheiden eines
Autors dessen Projektzugriff entfernen und bei Bedarf Tokens widerrufen.

## 4. CI und interne Runner

Die mitgelieferte Pipeline hat vier Schritte:

1. Node-Job: Demo-Inhalte, Konfiguration und Tests.
2. Ruby-Job: Jekyll erzeugt `_site/` als Artefakt.
3. Node-Job: interne Links und Ausschluss privater Quelldateien prüfen.
4. Geschützter Deploy-Job: Artefakt auf den internen Webserver übernehmen.

Die Build-Jobs benötigen einen isolierten Docker- oder Kubernetes-Runner, der
die angegebenen Node-/Ruby-Images laden darf. Bei einer Uni-internen Registry
entsprechend freigegebene Images einsetzen und nach Uni-Vorgabe per Digest
festschreiben. Keine Produktions-Mounts oder Deploy-Credentials in Build-Jobs
für ungeschützte Autorenbranches verfügbar machen.

Für den Deploy-Job einen separaten, projektgebundenen Runner einrichten:

- Tag `website-deploy`.
- **Protected** einschalten, keine ungetaggten Jobs, auf dieses Projekt sperren.
- Linux-Shell-Executor oder entsprechend isolierte Umgebung mit Bash, GNU
  coreutils und Zugriff auf das Veröffentlichungsverzeichnis.
- Als eigener unprivilegierter Benutzer; kein root und keine Schreibrechte an
  HAProxy-/Nginx-Konfigurationen, TLS-Schlüsseln oder Systemdiensten.
- Geschützte CI-Variable `DEPLOY_ROOT`, beispielsweise `/srv/www/portfolio`.
- CI-Variable `PUBLIC_SITE_URL`, beispielsweise `https://website.ch`.
- Den Defaultbranch tatsächlich schützen. Ohne diesen Schutz deployt das
  Beispiel bewusst nicht.

Auf dem Server einmalig ein Verzeichnis mit passenden Besitzerrechten anlegen.
Das Deployment-Skript erzeugt `releases/COMMIT-PIPELINE/` und wechselt den Link
`current` atomar. Nginx liest nur `current`. In GitLab außerdem das Verhindern veralteter Deployment-Jobs aktivieren, damit
eine verspätete ältere Pipeline keinen neueren Stand überschreibt.
Alte Releases bleiben für einen
Rollback erhalten; die Uni-IT legt Retention und Rückwechsel fest. Das Skript
löscht keine Releases und führt keinen `git pull` auf dem Webserver aus.

Ein Runner fragt GitLab aktiv nach passenden Jobs ab (Polling/Long Polling).
Es muss keine eingehende Runner-Verbindung aus dem Internet zum internen
Webserver geöffnet werden. Er muss GitLab samt Artefakt-Endpunkten per HTTPS
erreichen können. Das ist unabhängig von der öffentlichen HTTPS-Verbindung zu
HAProxy.

Ein Shell-Runner kann die im geschützten Branch freigegebenen CI-Kommandos
auf seinem Host ausführen. Deshalb müssen Änderungen an `.gitlab-ci.yml` und
Deploy-Skripten einem Maintainer-Review unterliegen. Bei höherem Schutzbedarf
für die Uni einen dedizierten isolierten Deploy-Runner verwenden.

## 5. Interner Webserver und HAProxy

`deploy/nginx.conf.example` liefert statische Dateien aus und hält `/admin/`
samt Rücksprung auf dieselbe URL erreichbar. Die Queryparameter des
OAuth-Rückrufs ändern die Dateiauswahl nicht. Es gibt keine PHP-/Node-/Ruby-App
auf dem Webserver.

`deploy/haproxy.cfg.example` zeigt:

- HTTP → HTTPS und eine festgelegte Domain.
- Öffentliches Zertifikat und TLS mindestens 1.2 mit TLS-1.3-Unterstützung.
- HSTS, Referrer Policy und ergänzende Response-Header.
- HTTPS auch zu Nginx, einschließlich Prüfung gegen die Uni-CA und Hostnamen.
- Path-only-Logging statt vollständiger OAuth-Callback-URLs mit Queryparametern.

Beide Dateien sind Beispiele für die Uni-IT. Hostnamen, interne IP, CA und
Zertifikatspfade anpassen, Zertifikatserneuerung organisieren und vor Übernahme
`haproxy -c -f ...` sowie `nginx -t` auf dem Zielsystem ausführen. Diese
Dienste sind auf dem Entwicklungsrechner nicht eingerichtet; ihre Konfiguration
ist dort nicht als Live-Installation geprüft.

Firewall: Der Webserver-Port ist nur von den HAProxy-Hosts erreichbar.
HAProxy muss eine fehlerhafte interne Zertifikatsprüfung als Fehler behandeln;
kein `verify none` als Dauerlösung. Falls HAProxy und Nginx auf demselben Host
über einen Unix-Socket kommunizieren sollen, ist das eine bewusst abweichende
Betriebsvariante der Uni-IT.

DNS für `website.ch` zeigt auf HAProxy, nicht auf GitLab oder den internen
Webserver. Private Schlüssel liegen außerhalb von Repository, Artefakt und
Document Root. Die Beispiele schalten nicht pauschal HSTS für andere Subdomains
oder einen Preload-Eintrag ein.

## 6. Abnahme

Mit der realen Uni-Installation prüfen:

- HTTPS außen und innen, korrekte Zertifikatsketten und Erneuerung.
- Uni-GitLab-Erreichbarkeit aus dem Autorenbrowser und CORS beim Token-Austausch.
- Ein eingeladener Autor meldet sich über `/admin/` an; ein nicht berechtigtes
  Konto kann keine Website-Dateien verändern.
- Entwurf, Datei-Upload, Merge Request, Freigabe und erfolgreiches Deployment.
- Abgelaufene Anmeldung bzw. Token-Refresh und erneutes Anmelden.
- Merge-Request-Pipelines können nicht auf dem Produktionsrunner deployen.
- Im Webroot liegen nur HTML, CSS, JS, CMS-Konfiguration und öffentliche Medien.
- Demo online deaktiviert oder bewusst für öffentliche Beispieldaten aktiviert.

Es wurden noch keine Uni-App, Runner oder Domains eingerichtet. Für den
Echtbetrieb fehlen die konkrete GitLab-Adresse, Projektpfad, Application ID und
Server-/DNS-Einstellungen.

## Primärquellen

- [Decap: GitLab-PKCE und Self-Hosted-Konfiguration](https://decapcms.org/docs/gitlab-backend/)
- [GitLab OAuth-Anwendungen](https://docs.gitlab.com/integration/oauth_provider/)
- [GitLab OAuth, PKCE, Refresh und CORS](https://docs.gitlab.com/api/oauth2/)
- [GitLab Runner und Jobausführung](https://docs.gitlab.com/ci/runners/)
- [HAProxy-Konfigurationsreferenz](https://docs.haproxy.org/3.2/configuration.html)
