# Kurzanleitung für Autoren

## Demo für eine Vorführung

1. Online die im README verlinkte GitHub-Pages-Demo unter `/admin/` öffnen.
   Alternativ lokal nach dem Build `npm run demo` starten und
   <http://127.0.0.1:4000/admin/demo/> öffnen.
2. Auf **Login** klicken. Es wird kein GitLab-Konto und kein Passwort verlangt.
3. Unter **Website** oder **Projekte** einen Eintrag öffnen und ändern.
4. Unten **Website-Vorschau ↗** anklicken. Im neuen Tab erscheint das normale
   Website-Layout mit den aktuellen Eingaben. Dafür muss nichts gespeichert werden.
5. Weiter bearbeiten und zum Aktualisieren erneut **Website-Vorschau** anklicken.

Die Vorschau zeigt den aktuellen Eintrag; andere Inhalte stammen aus dem
veröffentlichten Build. Der Hinweis **Private Vorschau** kennzeichnet den Tab.
Ein regulärer Website-Tab zeigt weiterhin die öffentliche Version. Ein kopierter
Vorschau-Link enthält keine Änderungen und zeigt sie einem anderen Besucher nicht.

Es werden keine Git-Dateien verändert und keine Inhalte unter deinem Namen
veröffentlicht. Die Änderungen liegen nur im geöffneten Editorfenster und werden
beim Neuladen verworfen. Falls der Browser den Vorschau-Tab blockiert, Pop-ups
für die Demo erlauben. Die integrierte vereinfachte Vorschau rechts im Editor
bleibt ebenfalls verfügbar.

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
