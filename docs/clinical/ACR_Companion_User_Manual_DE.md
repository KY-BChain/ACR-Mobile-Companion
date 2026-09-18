# ACR Companion: Benutzerhandbuch für Prüfer

**Gilt für:** v0.6.7 (Build 48). Die von Ihnen verwendete Version wird auf dem Bildschirm **Über** angezeigt.
**Aktualisiert:** 18. September 2026
**Status:** von CRIL für die eingeladene Evaluierung freigegeben. Nicht zur öffentlichen Verteilung.
**Für:** eingeladene klinische Prüfer und Evaluierungstester.
**Chinesische Version:** ACR_Companion_User_Manual_ZH-CN.

---

## 1. Bevor Sie weiterlesen

- **Nur synthetische Daten.** Geben Sie niemals Daten eines echten Patienten ein, auch nicht kodiert oder pseudonymisiert. Die App fragt weder nach Namen noch nach Krankenhausnummer.
- **Nicht für den klinischen Gebrauch.** Ergebnisse sind Entscheidungsunterstützung für die Evaluierung. Sie dürfen nicht zur Diagnose oder Behandlung von Personen verwendet werden.
- **Die App enthält keine klinischen Regeln.** Alles, was Sie in einem Ergebnis sehen, stammt von der ACR-Plattform. Die App sammelt Ihre Eingaben, sendet sie sicher und zeigt die Antwort an.
- **Wie die Regeln funktionieren** (Subtyp, Risiko, Therapielinien, Bayes’sche Konfidenz) wird im Begleitdokument *ACR Companion — Prüf- und Testliste für ZZU-Prüfer* erklärt. Dieses Handbuch erklärt die Bedienung der App.

In diesem Handbuch sind **fettgedruckte Wörter** die Namen von Schaltflächen und Bildschirmen, genau wie sie in der englischen Oberfläche erscheinen.

---

## 2. Was Sie benötigen

| | |
|---|---|
| Telefon | Ein Android-Telefon oder ein iPhone |
| Einladungscode | Ein persönlicher Code, den Sie von CRIL erhalten. Halten Sie ihn geheim |
| Internet | WLAN oder mobile Daten, um Ergebnisse zu erhalten |
| Sprache | English (UK), 简体中文, Français, Deutsch, Русский, العربية, 한국어 oder 日本語. Bisher wurden nur Englisch und Chinesisch geprüft; die anderen Übersetzungen sind Entwürfe |

---

## 3. Installieren der App

**CRIL teilt Ihnen mit, wie Sie die App für Ihr Telefon erhalten.** Installieren Sie nur die Datei oder den Link, den CRIL Ihnen sendet.

**Android**
1. Öffnen Sie die Installationsdatei (endet auf `.apk`), die CRIL Ihnen gesendet hat.
2. Wenn das Telefon fragt, erlauben Sie die Installation aus dieser Quelle (zum Beispiel Ihrem Browser oder Dateimanager). Einige Telefone, etwa Xiaomi und Samsung, zeigen eine zusätzliche Sicherheitsabfrage: Wählen Sie Fortfahren.
3. Wenn die Installation abgeschlossen ist, öffnen Sie **ACR Companion**.

**iPhone**
Die iPhone-Installation wird von CRIL separat organisiert. Beim ersten Öffnen der App kann das iPhone verlangen, dass Sie dem Entwickler vertrauen: Gehen Sie zu *Einstellungen → Allgemein → VPN & Geräteverwaltung* und vertrauen Sie ihm.

Wenn bereits eine frühere Version installiert ist, teilt CRIL Ihnen mit, ob Sie darüber aktualisieren oder sie zuerst entfernen sollen.

---

## 4. Die Bildschirme auf einen Blick

| Reihenfolge | Bildschirm | Was Sie dort tun |
|---|---|---|
| — | **Evaluierungszugang** | Mit Einladungscode verbinden; Live-Plattform oder Synthetische Demonstration wählen |
| — | Willkommen (**Bevor Sie beginnen**) | Hinweise lesen; Sprache ändern; **Über** öffnen |
| 1 von 5 | **Rezeptorstatus** | ER, PR, HER2, Ki-67 |
| 2 von 5 | **Tumormerkmale** | Stadium, Grad, Histologie, Nodalstatus, Alter |
| 3 von 5 | **Biomarker und Operation** | CA 15-3, CEA, Operationsdatum, Bayes’sche Option |
| 4 von 5 | **Kernvertragsfelder** | Tumorgröße, Geschlecht |
| 5 von 5 | **Zusätzliche Vertragsfelder** | ECOG, PD-L1, HER2-low, LVEF, Behandlungsabsicht |
| — | **Prüfung** | Alles prüfen, dann **Senden** |
| — | **Bewertungsergebnis** | Ergebnis lesen |

Jeder Eingabebildschirm zeigt oben *Schritt n von 5* und unten **Zurück** und **Weiter**.

---

## 5. App öffnen und Sprache wählen

1. Öffnen Sie die App. Sie startet bei **Evaluierungszugang**.
2. Um die Sprache zu ändern, tippen Sie auf **Zurück**, um den Willkommensbildschirm zu erreichen, tippen Sie auf **Sprache** und wählen Sie. Jeder Bildschirm folgt Ihrer Wahl; Arabisch wird von rechts nach links gelesen.
3. Der Willkommensbildschirm enthält außerdem **Über**, das die ACR-Plattform beschreibt und die Version der App anzeigt.
4. Wenn Sie einige Sekunden auf dem Willkommensbildschirm bleiben, erscheint ein einseitiges Einführungsposter. Wischen Sie seitwärts für den Hinweis **Datenschutz & Cookies**, wo **DETAILS LESEN** dieses Handbuch auf dem Telefon öffnet. Wischen Sie nach oben, um fortzufahren.
5. Tippen Sie auf **Ich verstehe — Beginnen**, um zu **Evaluierungszugang** zurückzukehren.

---

## 6. Erstmalige Verbindung

1. Geben Sie auf **Evaluierungszugang** Ihren Einladungscode in **Einladungscode** ein.
2. Tippen Sie auf **Sicher verbinden**.
3. Eine Meldung bestätigt: *„Einladungscode akzeptiert und mit diesem Mobilgerät und nur diesem Mobilgerät gekoppelt. Für 30 Tage.“* Sie zeigt auch das Kopplungsdatum und das Ablaufdatum (in UTC). Tippen Sie auf **Weiter**.
4. Tippen Sie auf **Weiter**, um eine Bewertung zu starten.

**Bitte beachten:**
- **Ihr Code funktioniert nur auf einem Telefon.** Das erste Telefon, auf dem er eingegeben wird, wird mit ihm gekoppelt. Auf jedem anderen Telefon zeigt die App *„Falsches Gerät verwendet.“*
- **Der Zugang dauert 30 Tage** ab der Kopplung. Danach zeigt die App *„Einladungscode abgelaufen. Fordern Sie einen neuen an.“* Bitten Sie CRIL um einen neuen Code.
- **Sie geben den Code nur einmal ein.** Danach verbindet sich die App beim Öffnen automatisch wieder. Sie würden ihn erst nach **Zugang trennen** erneut eingeben (siehe Abschnitt 12), und die 30 Tage beginnen nicht neu.
- Der Code selbst wird nie auf dem Telefon gespeichert.

### Das Verbindungsfenster
**Verbindungsnachweis** auf demselben Bildschirm zeigt:
- **Gateway:** **Verbunden**, **Server nicht verbunden** oder **Prüfen…**
- **Basisattestierung:** **VERIFIZIERT** bedeutet, dass die ACR-Plattform genau die freigegebene Version ist und Live-Ergebnisse erzeugt werden können. **ABWEICHUNG** oder **NICHT VERFÜGBAR** bedeutet, dass Live-Ergebnisse blockiert sind.

---

## 7. Live-Plattform oder Synthetische Demonstration

Wählen Sie unter **Bereitstellungsmodus**, bevor Sie beginnen:

| Wahl | Was passiert | Verwendung |
|---|---|---|
| **Live-Plattform** (blau) | Ihre Eingaben werden an die ACR-Plattform gesendet, die ihre klinischen Regeln jetzt anwendet | Alle echten Testfälle |
| **Synthetische Demonstration** (bernsteinfarben) | Es werden keine Regeln ausgeführt. Die App füllt einen festen Demonstrationsfall ein, und der Dienst zeigt ein früher von der Live-Plattform aufgezeichnetes Ergebnis für genau diesen Fall | Ein schneller Blick auf ein vollständiges Ergebnis, oder wenn die Live-Plattform offline ist |

Im Demonstrationsmodus **ändern Sie keinen Wert**. Wenn doch, zeigt die Prüfung ein rotes Feld **Demonstrationsfall geändert** und es wird kein Ergebnis zurückgegeben.

---

## 8. Einen Fall eingeben

### Allgemeine Hinweise
- **Pflichtfelder:** nur ER, PR, HER2 und Ki-67 auf Bildschirm 1. **Weiter** bleibt nicht verfügbar, bis Ki-67 eine Zahl von 0 bis 100 ist.
- **Alles andere ist optional,** aber einige Werte sind mit **für eine vollständige Bewertung erforderlich** markiert. Ohne sie antwortet die Plattform trotzdem, hält aber das Risiko zurück (Abschnitt 10).
- **Auswahlmöglichkeiten** sind Schaltflächen: Tippen Sie eine an, um sie auszuwählen.
- **Zahlen:** Tippen Sie nach der Eingabe auf **Fertig** über der Tastatur (iPhone) oder auf die Haken-/Fertig-Taste der Tastatur (Android), um die Tastatur zu schließen.
- **Fehler:** Ein ungültiger Wert wird rot mit einer kurzen Erklärung angezeigt, zum Beispiel *„Geben Sie einen Wert von 0 bis 100 ein.“*
- **Beispielwerte:** Um Zeit zu sparen, öffnen sich die Bildschirme 1–3 einer neuen Live-Bewertung **bereits ausgefüllt** mit einem synthetischen Beispielfall. Ändern Sie sie nach Bedarf. Bildschirme 4 und 5 öffnen sich leer.

### Bildschirm 1 von 5 — Rezeptorstatus

| Feld | Eingabe | |
|---|---|---|
| ER-Status | positiv / negativ | erforderlich |
| PR-Status | positiv / negativ | erforderlich |
| HER2-Status | positiv / negativ | erforderlich |
| Ki-67 (%) | 0–100 | erforderlich |

Der Hinweis *„Luminal A < 14, Luminal B ≥ 14“* ist nur eine Orientierung; die Plattform entscheidet den Subtyp.

*Bitte beachten: HER2 bietet derzeit nur Positiv oder Negativ. Es gibt noch keine Wahl „2+, ISH ausstehend“ (äquivalent). Ein Fall, der normalerweise als äquivalent dokumentiert würde, kann derzeit nicht so eingegeben werden; bitte informieren Sie CRIL, wenn dies Ihre Tests betrifft.*

Der Bildschirm zeigt außerdem die **Sitzungs-ID**, eine zufällige Referenz, die für jede Bewertung erstellt wird. Sie ist keine Patientenidentifikation.

### Bildschirm 2 von 5 — Tumormerkmale

| Feld | Eingabe | |
|---|---|---|
| Stadium | 0 bis IV, mit Unterstufen | für eine vollständige Bewertung erforderlich |
| Grad | 1, 2 oder 3 | für eine vollständige Bewertung erforderlich |
| Histologischer Subtyp | IDC, ILC, DCIS oder Paget-Krankheit | optional |
| Nodalstatus | N0, N1, N2 oder N3 | für eine vollständige Bewertung erforderlich |
| Alter (Jahre) | ganze Jahre, 18–120 | für eine vollständige Bewertung erforderlich |

### Bildschirm 3 von 5 — Biomarker und Operation

| Feld | Eingabe | |
|---|---|---|
| CA 15-3 (U/mL) | 0 oder mehr | optional |
| CEA (ng/mL) | 0 oder mehr | optional |
| Operationsdatum | JJJJ-MM-TT (zukünftige Daten werden akzeptiert) | optional |
| Bayes’sche Erweiterung | EIN / AUS | optional |

### Bildschirm 4 von 5 — Kernvertragsfelder
Dieser Bildschirm und der nächste sind mit **NUR EVALUIERUNG · VORLÄUFIGE FELDER** gekennzeichnet: Ihre klinischen Definitionen werden noch geprüft.

| Feld | Eingabe | |
|---|---|---|
| Tumorgröße | eine Zahl über 0. **Die Einheit ist noch nicht festgelegt** | für eine vollständige Bewertung erforderlich |
| Geschlecht | weiblich / männlich / anderes / unbekannt | optional |

### Bildschirm 5 von 5 — Zusätzliche Vertragsfelder

| Feld | Eingabe | |
|---|---|---|
| ECOG-Score | ganze Zahl, 0–4 | für eine vollständige Bewertung erforderlich |
| PD-L1-Status | positiv / negativ / nicht getestet | optional |
| HER2-low | positiv / negativ / unbekannt | optional |
| LVEF (%) | 0–100 | optional |
| Behandlungsabsicht | neoadjuvant / adjuvant / nicht angegeben | optional |

Tippen Sie auf **Prüfung**, wenn Sie fertig sind.

---

## 9. Prüfung und Senden

**Prüfung** listet jeden Wert auf, bevor etwas gesendet wird.

- **Rotes Feld „Für eine vollständige Bewertung erforderlich“:** listet Werte auf, die Sie leer gelassen haben und die die Plattform benötigt. Tippen Sie auf einen Link **Gehe zu …**, um zu diesem Bildschirm zu springen; Ihre anderen Eingaben bleiben erhalten. **Sie können trotzdem senden.**
- **„Beispielwert, nicht geändert“:** markiert einen Beispielwert, den Sie nicht geändert haben, damit Sie Ihre eigenen Eingaben unterscheiden können.
- **Bereitstellungsmodus:** zeigt Live oder Synthetische Demonstration (bernsteinfarben).
- **Basis:** Senden ist nur möglich, wenn die Plattform **VERIFIZIERT** ist.

Tippen Sie auf **Bearbeiten**, um zu Bildschirm 1 zurückzukehren, oder auf **Senden**, um den Fall zu senden.

Wenn Sie einen Live-Fall senden, prüft der Dienst zuerst, ob die Plattform noch die freigegebene Version ist. Wenn dies nicht bestätigt werden kann, **wird kein Ergebnis angezeigt**. Sie sehen **Dienst nicht verfügbar** mit dem Grund, zum Beispiel dass die Plattform nicht der freigegebenen Version entspricht. **Verifizierung wiederholen** wiederholt nur die Prüfung; der Fall wird nie erneut gesendet.

*Bitte beachten: Der plattformeigene Wortlaut „ASSESSMENT BLOCKED“, den Sie in einem vollständigen Ergebnis für einen unvollständigen Fall sehen können (Abschnitt 10), ist anders. Dieses Ergebnis zeigt weiterhin Subtyp, Therapielinien und Biomarker; nur das Risiko wird zurückgehalten.*

---

## 10. Das Ergebnis lesen

Der Bildschirm **Bewertungsergebnis** zeigt von oben nach unten:

1. **Klinische Zusammenfassung:** **Molekularer Subtyp** und **Risiko**. Risiko ist ein Wort in Ihrer Sprache: HOCH, MITTEL oder NIEDRIG. Rot bedeutet hoch, Grün niedrig, Blau alles andere. Eine Zeile sagt, woher das Ergebnis stammt (verifizierte Live-Plattform oder ein früher aufgezeichnetes synthetisches Ergebnis).
2. **Vollständige Bewertung nicht erreicht** (nur unvollständige Fälle; siehe unten).
3. **Warnungen und Kontext:** die eigenen Meldungen der Plattform, unverändert, auf Englisch.
4. **Informationsvollständigkeit:** die Vollständigkeitsstufe und fehlende Werte mit ihren Bildschirmnummern.
5. **Zurückgegebene Behandlungsoptionen:** genau so, wie die Plattform sie geschrieben hat.
6. **Zurückgegebene Biomarkerergebnisse.**
7. **Klassifikationskonfidenz:** wird angezeigt, wenn die Bayes’sche Erweiterung EIN ist. Lesen Sie die Prüf- und Testliste, Abschnitt C7, bevor Sie sich auf diese Zahl verlassen: Sie kann sich auf einen anderen Subtyp beziehen als den angezeigten.
8. **Technische Details:** ausgelöste Regeln, Argumentationsspur, Rohwerte und Plattformversion.

### Wenn ein Fall unvollständig ist
Wenn Sie einen Wert ausgelassen haben, den die Plattform benötigt:
- **Vollständige Bewertung nicht erreicht** nennt die fehlenden Werte und ihre Bildschirme, zum Beispiel *„Tumorgröße (Bildschirm 4 von 5)“*.
- **Risiko** lautet *„zurückgehalten — benötigt …“*.
- Subtyp, Behandlungsoptionen und Biomarker werden **weiterhin angezeigt**.
- Tippen Sie auf **Fehlende Felder ergänzen**. Die App öffnet den Bildschirm mit dem ersten fehlenden Wert und **behält alles, was Sie eingegeben haben**. Fügen Sie den Wert hinzu, gehen Sie zu **Prüfung** und senden Sie erneut.

### Das Ergebnis wird nicht gespeichert
Das Ergebnis existiert nur, solange der Bildschirm geöffnet ist. Nichts wird im Speicher des Telefons gespeichert. Wenn Sie eine Aufzeichnung benötigen, notieren Sie die Werte von Hand oder machen Sie einen Screenshot, wenn Ihre Organisation dies erlaubt.

---

## 11. Eine weitere Bewertung starten

Tippen Sie auf **Neue Bewertung** oder **Fertig**. Alle Eingaben werden gelöscht und die App kehrt zu **Evaluierungszugang** zurück, weiterhin verbunden. Tippen Sie auf **Weiter**, um zu beginnen.

---

## 12. Trennen der Verbindung

Tippen Sie auf **Evaluierungszugang** auf **Zugang trennen**. Die App bittet um Bestätigung: *„Sie müssen den Einladungscode erneut eingeben.“* Tippen Sie auf **Trennen**. Tun Sie dies nur, wenn CRIL es verlangt oder wenn Sie das Telefon an jemand anderen weitergeben.

---

## 13. Meldungen und was zu tun ist

| Was Sie sehen | Was es bedeutet | Was zu tun ist |
|---|---|---|
| **Prüfen…** | Die App kontaktiert den Dienst | Warten Sie etwa 10 Sekunden |
| **Auf diesem Gerät angemeldet** — *„Warten auf den Server…“* | Sie sind gekoppelt, aber der Dienst ist nicht erreichbar | Prüfen Sie Ihr Internet; tippen Sie auf **Prüfung wiederholen**. Kein Einladungscode erforderlich |
| **Server nicht verbunden** | Der ACR-Evaluierungsdienst ist offline | Später versuchen oder CRIL informieren. Sie können weiterhin **Synthetische Demonstration** verwenden, wenn angeboten |
| **Gateway verbunden — Live-Plattform offline** | Der Dienst läuft, aber die ACR-Plattform nicht | Verwenden Sie **Synthetische Demonstration**, oder versuchen Sie es später |
| **Dienst nicht verfügbar** / **ABWEICHUNG** | Die Plattform ist nicht die freigegebene Version | Fahren Sie nicht mit Live-Tests fort; informieren Sie CRIL |
| *„Falsches Gerät verwendet.“* | Der Code ist mit einem anderen Telefon gekoppelt | Verwenden Sie Ihr gekoppeltes Telefon oder bitten Sie CRIL um einen neuen Code |
| *„Einladungscode abgelaufen. Fordern Sie einen neuen an.“* | Die 30 Tage sind abgelaufen | Bitten Sie CRIL um einen neuen Code |
| **Demonstrationsfall geändert** (rot) | Ein Demonstrationswert wurde geändert | Setzen Sie ihn zurück oder wechseln Sie zu **Live-Plattform** |
| **Die verifizierte synthetische Fixture ist nicht verfügbar.** | Keine aufgezeichnete Demonstration verfügbar | Verwenden Sie **Live-Plattform**; oder gehen Sie auf einem gekoppelten Telefon **Alle fünf Bildschirme durchgehen**, um die Bildschirme ohne Ergebnis anzusehen |
| *„Zu viele Anfragen…“* | Zu viele Versuche in kurzer Zeit | Warten Sie einige Minuten |
| *„Das Bewertungsergebnis ist unsicher.“* | Die Antwort kam nicht klar an | Nicht wiederholt senden; notieren Sie die Zeit und informieren Sie CRIL |

---

## 14. Ihre Daten und Privatsphäre

- Der Einladungscode wird nie gespeichert. Ihre Sitzung und eine zufällige Installationskennung werden nur im sicheren Keystore des Telefons aufbewahrt und beim Trennen entfernt.
- Falleingaben und Ergebnisse werden nur im Speicher gehalten und gelöscht, wenn die Bewertung endet.
- Die App hat keine Analyse und keine Werbung und kann nicht over-the-air aktualisiert werden: Jede Änderung ist eine neue, geprüfte Version.
- Der Dienst zeichnet technische Ereignisse auf (zum Beispiel Zeit und Ergebnis einer Anfrage), um ihn sicher zu halten; klinische Werte werden nicht aufgezeichnet.

---

## 15. Rechtlicher Hinweis: DSGVO und Cookies

*Betrifft nur diese App. Die Website der ACR-Plattform hat ihren eigenen Hinweis.*

### Cookies
Diese App verwendet keine Cookies, Web-Beacons oder Tracking-Technologie.

### Datenschutz
Verantwortlicher: Cornerstone Research International Ltd (CRIL), c/o NovaUCD, Belfield Innovation Park, University College Dublin, Dublin 4, D04 V2P1, Irland. E-Mail: info@acragent.com · www.acragent.com

- Erhobene Daten: Einladungslabel und Organisationstag; eine von der App erzeugte zufällige Gerätekennung (nur gehasht gespeichert); Kopplungs- und Ablaufdaten; App-Version; Sicherheitsereignisse und Anfrageprotokolle (Zeit, Route, Ergebnis — nie Inhalt).
- Netzwerkdaten: Ihre IP-Adresse wird von unserem Netzwerkanbieter Cloudflare verarbeitet, um den Dienst bereitzustellen und zu schützen.
- Nicht erhoben: Ihr Name oder Ihre Kontaktdaten oder Patientendaten. Synthetische Falleingaben werden nur verarbeitet, um ein Ergebnis zurückzugeben, und nicht gespeichert.
- Zweck: Betrieb und Sicherung dieser eingeladenen Evaluierung.
- Rechtsgrundlage: durch rechtliche Prüfung zu bestätigen.
- Empfänger: Cloudflare, Inc., die Daten außerhalb Ihres Landes verarbeiten kann.
- Aufbewahrung: Der Zugang endet 30 Tage nach der Kopplung oder bei Widerruf; Aufzeichnungen werden 30 Tage nach Ende der Evaluierung gelöscht. CRIL kann diesen Zeitraum ändern.
- Ihre Rechte: Auskunft, Berichtigung, Löschung, Einschränkung und Widerspruch — kontaktieren Sie CRIL (Abschnitt 16). EU/EWR/UK: Sie können sich bei Ihrer Datenschutzbehörde beschweren.

*Vollständige Datenschutzerklärung auf Anfrage bei CRIL erhältlich.*

---

## 16. Ein Problem oder einen Kommentar melden

Bitte senden Sie Ihre Ergebnisse an CRIL mit:
- Telefonmodell und Betriebssystemversion;
- App-Version (**Über**);
- verwendete Sprache;
- Datum und Uhrzeit;
- was Sie eingegeben haben (nur synthetische Werte), was Sie erwartet haben und was Sie gesehen haben;
- einen Screenshot, falls hilfreich.

Klinische Kommentare zu den Regeln selbst gehören in die *Prüf- und Testliste*.

---

## 17. Verwendete Begriffe

| Begriff | Bedeutung |
|---|---|
| ACR-Plattform | Der Server, der das medizinische Wissensmodell und die Regeln enthält und Ergebnisse erzeugt |
| Gateway | Der sichere Dienst zwischen der App und der ACR-Plattform |
| Basis / Attestierung | Die Prüfung, dass die Plattform genau die freigegebene Version ist |
| Stufe | Wie vollständig der Fall ist: 1 oder 2 bedeutet, das Risiko wird zurückgehalten; 3 ist eine vollständige Bewertung |
| Synthetisch | Erfundene Testdaten, nicht von einem Patienten |
| Bayes’sche Erweiterung | Eine optionale Wahrscheinlichkeitsschätzung, die dem regelbasierten Ergebnis hinzugefügt wird |