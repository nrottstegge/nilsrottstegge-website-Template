# Sicherheitskonzept

## Verschlüsselung

HTTPS schützt sowohl Besucher ↔ HAProxy als auch HAProxy ↔ interner Webserver.
Das Beispiel verlangt mindestens TLS 1.2, unterstützt TLS 1.3 und prüft das
interne Serverzertifikat gegen die Uni-CA sowie den erwarteten Hostnamen.
PKCE-Login, GitLab-API und Runner-Kommunikation laufen ebenfalls über HTTPS.
Zertifikate, gültige CA-Ketten, Erneuerung, DNS und Firewall müssen an der
Uni-Infrastruktur tatsächlich eingerichtet und abgenommen werden.

Es gibt keine selbst entworfene Passwortverschlüsselung. GitLab übernimmt die
Konten und gegebenenfalls Uni-SSO und 2FA. Eine sichere Vorlage garantiert noch
keine sichere Live-Installation; ein externes Sicherheits-Audit wurde nicht
durchgeführt.

## GitLab-PKCE

Decaps mitgeliefertes GitLab-Backend verwendet den Authorization-Code-Flow mit
PKCE S256, zufälligem Verifier und State/Nonce-Prüfung. Die App ist in GitLab als
öffentlicher Client (Confidential aus) mit exakter HTTPS-Redirect-URI registriert.
Eine Application ID ist öffentliche Konfiguration; ein Client Secret darf nicht
in Browser oder Repository liegen. Der veraltete Implicit-Flow ist nicht aktiv.

Decap erledigt diesen Ablauf, nicht eigener OAuth-Servercode im Template.
Die tatsächliche Anmeldung und der Refresh mit der verwendeten Uni-GitLab-Version
können erst nach Registrierung der echten App getestet werden. Browser können
nur dann direkt mit GitLab arbeiten, wenn dessen OAuth- und API-Endpunkte
öffentlich oder über das Uni-VPN erreichbar sind.

## Tokens und Rechte

Decaps Standard-GitLab-Backend verlangt `api`. Die Token-Rechte sind an den
Benutzer gebunden, aber nicht allein durch die Decap-Projektkonfiguration auf
ein einziges Repository beschränkt. PKCE schützt den Anmeldecode; es verengt
keine API-Berechtigung. Access-/Refresh-Tokens werden vom CMS im Browser
verwaltet. Sie sind nicht durch ein serverseitiges HttpOnly-Session-Cookie vor
JavaScript verborgen.

Wenn die Uni solche Browser-Tokens oder den Scope nicht zulässt, ist diese
Architektur entsprechend zu ändern, beispielsweise durch ein geprüftes
serverseitiges Backend mit engerem Autorisierungsmodell. Kein gemeinsamer
Personal Access Token als Ersatz für persönliche Anmeldung.

Autorenrechte über GitLab-Mitgliedschaften verwalten. Ein redaktioneller
Entwurfsstatus ersetzt keine Branch-Regeln. Der Produktionsbranch und der
Deploy-Runner sind geschützt; CI- und Deploy-Code wird von Maintainers geprüft.
Mitarbeiterentzug, Token-Widerruf und regelmäßige Rechteprüfung gehören zum
Betrieb.

## Browser und CSP

Decap 3.17.3 wird lokal mit seinen Laufzeitdateien ausgeliefert. Hashes werden
vor Builds geprüft; fremde Widgets und ungeprüfte Skripte gehören nicht in die
Redaktion. Decap benötigt `unsafe-eval` für die AJV-Konfigurationsprüfung und
Inline-Styles für seine Oberfläche. Nur die CMS-Seiten erhalten dafür eine
entsprechende CSP; Inline-Skripte bleiben gesperrt. `connect-src` der echten
Redaktion erlaubt die eigene Website und die konfigurierte Uni-GitLab-Origin.
Die Demo erlaubt keine GitLab-API-Verbindung.

Die CSP ist als Meta-Tag wirksam; die Datei `admin/security-policy.txt` enthält
die generierte Richtlinie. Bei strengeren Vorgaben sollte die Uni-IT sie
zusätzlich als passenden HTTP-Response-Header für `/admin/` ausliefern. Keine
pauschale `script-src *`-Freigabe ergänzen. Bei einem generellen Verbot von
`unsafe-eval` ist eine angepasste CMS-Version oder ein anderes CMS erforderlich.

Markdown und Repository-Mitglieder mit Schreibrechten sind vertrauenswürdige
Autoren, keine voneinander isolierten Mandanten. Die Formulare sind keine
Sicherheitsgrenze gegen böswillige Repository-Collaborators.

## Server und CI

Der Webserver liefert ausschließlich `_site/` aus. Git-Metadaten, CI-Dateien,
Deploy-Skripte, private Schlüssel und Dokumentation werden nicht veröffentlicht.
Der Build prüft interne Links und den Ausschluss privater Quelldateien.

Build-Runner laufen isoliert ohne Produktionsrechte. Der eigene Deploy-Runner
ist projektgebunden, geschützt und unprivilegiert. Die Vorlage deployt nur den
geschützten Defaultbranch; Merge Requests können nicht produktiv ausliefern.
Deployments werden serialisiert, auf Symlinks im Artefakt geprüft und als neue
Releases atomar aktiviert. Retention und Rollback sind Betreiberaufgaben.

HAProxy protokolliert nur Pfade, keine OAuth-Code-Queryparameter. Der
Nginx-Zugriffslog des Beispiel-VHosts ist deaktiviert. Auch zentrale Proxies,
Tracing und Security-Systeme dürfen Authorization-Header, Tokens und
Callback-Parameter nicht unkontrolliert protokollieren.

## Demo

`test-repo` hat absichtlich keine echte Benutzeranmeldung. Auf GitHub Pages
verwendet auch `/admin/` diesen Modus; die dortige CSP erlaubt keine externe
Repository-API. Git-Push testet die Pipeline, Speichern im Demo-Editor nicht. Die Inhalte werden nur
im Browser-Arbeitsspeicher geändert und beim Neuladen zurückgesetzt. Es gibt
keine Schreibverbindung zum GitLab-Repository. Produktionsbuilds deaktivieren
sie standardmäßig. Eine aktivierte öffentliche Demo ist keine vertrauliche,
passwortgeschützte Redaktion. Die lokale Vorführung bindet nur an Loopback.

## Wartung

Jekyll-Gems, Decap, Runner und CI-/Server-Images regelmäßig aktualisieren.
Versions- und Integritätsdaten des CMS liegen unter `admin/vendor/`. Die Uni-IT
legt unterstützte Versionen, Image-Digests, Zertifikatserneuerung, Backups,
Überwachung und Reaktion auf Konto- oder Token-Kompromittierung fest.

Primärquellen: [GitLab OAuth](https://docs.gitlab.com/api/oauth2/),
[Decap GitLab](https://decapcms.org/docs/gitlab-backend/),
[GitLab Runner](https://docs.gitlab.com/ci/runners/),
[HAProxy](https://docs.haproxy.org/3.2/configuration.html).

## Private Website-Vorschau der Demo

Der Editor übergibt ausschließlich den aktuellen Inhalt und aufgelöste
Medienadressen an ein von ihm geöffnetes Fenster derselben Origin. Es werden
keine Authentifizierungsdaten übergeben. Entwürfe stehen weder im Querystring
noch in Local-/Session-Storage oder einem Server-Upload. Ein anderes Fenster
mit demselben Link hat keinen Zugriff auf diese Daten. Das Öffnen der normalen
Website verändert sie nicht.

Die Darstellung verwendet Textknoten und geprüfte Link-/Medienadressen.
Rich-Text-Markup wird auf erlaubte Elemente ohne Skripte, Event-Handler oder
aktive eingebettete Dokumente begrenzt. Die Vorschau übernimmt den aktuell
geöffneten Eintrag; sie ist kein Jekyll-Preview-Server für mehrere Entwurfsbranches.
