# Kurzanleitung für Autoren

## Demo für eine Vorführung

1. Online die im README verlinkte GitHub-Pages-Demo unter `/admin/` öffnen.
   Alternativ lokal nach dem Build `npm run demo` starten und
   <http://127.0.0.1:4000/admin/demo/> öffnen.
3. Auf **Login** klicken. Es wird kein GitLab-Konto und kein Passwort verlangt.
4. Unter **Website** beispielsweise die Themenzeile ändern oder unter
   **Projekte** ein Projekt auswählen.
5. Änderungen und Vorschau zeigen. Speichern und den redaktionellen Workflow
   ausprobieren. Beim Neuladen verschwinden alle Demo-Änderungen.

Die Demo ändert weder Git-Dateien noch die echte Website. Der grüne Hinweis
unten kennzeichnet den Modus. Die Website in einem zweiten Tab zeigt den
ursprünglichen Build, nicht die im Browser geänderten Demo-Daten.

## Echte Redaktion

Nach der technischen Einrichtung `/admin/` an der festgelegten Website-Domain
öffnen und **Login with GitLab** wählen. Das persönliche GitLab-Konto verwenden;
keine gemeinsamen Zugangsdaten teilen. Das OAuth-Fenster und ggf. 2FA bestätigen.

## Ein Projekt bearbeiten

**Projekte** öffnen, das gewünschte Projekt wählen und die beschrifteten Felder
ändern. Die Vorschau zeigt Titel, Text und Bilder. Die vollständige
Scroll-Animation und die interaktiven Spezialgrafiken erscheinen auf der
gebauten Website, nicht innerhalb der vereinfachten Redaktionsvorschau.

Für ein neues Projekt **Neues Projekt** wählen, alle Pflichtfelder ausfüllen und
mindestens ein Bild, Video oder eine interaktive Abbildung angeben. Der Titel
bestimmt beim Anlegen den Dateinamen und damit die Webadresse. Die Reihenfolge
auf der Startseite steuert das Zahlenfeld **Reihenfolge**.

## Bilder, Videos und PDF-Dateien

Bilder über das Bildfeld hochladen und einen verständlichen Alternativtext
eintragen. Für ein neues Video das Feld **Video (MP4)** verwenden und möglichst
ein Vorschaubild hochladen. Sehr große Dateien vorher komprimieren; dieses
Template verwendet das normale GitLab-Repository und kein Git LFS.

Den Lebenslauf unter **Website → Profil, Kontakt und CV → Lebenslauf (PDF)**
ersetzen. Es ist keine zusätzliche lokale CV-Synchronisierung nötig.

## Speichern und veröffentlichen

Ein gespeicherter Entwurf ist noch nicht online. Im redaktionellen Workflow den
Inhalt zur Prüfung freigeben und anschließend veröffentlichen. Bei geschütztem
Hauptbranch gibt die zuständige Person den Merge Request in GitLab frei. Nach
einem erfolgreichen Website-Build ist der neue Stand sichtbar.

Bei gleichzeitigem Bearbeiten desselben Inhalts die Änderungen abstimmen.
Wenn GitLab einen Konflikt meldet, nichts überschreiben, sondern die technische
Ansprechperson hinzuziehen.
