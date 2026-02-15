# Taschenspielplatz — Konzept-Zusammenfassung

## Was es ist

Eine interaktive Spielwelt für Kinder (2–5 Jahre), gemacht für unterwegs — Autofahrt, Restaurant, Wartezimmer. Das Kind hält das Handy oder Tablet und steuert Fahrzeuge durch eine Miniaturstadt. Kein Spiel: kein Score, keine Level, kein Richtig/Falsch. Eine reaktive Bühne, auf der das Kind die Geschichte bestimmt.

## Herkunft

Weiterentwicklung von "Toyscape" (https://github.com/harryherbig/toyscape), einer Tile-basierten Spielmatte, bei der ein Tablet flach auf dem Tisch liegt und echte Spielzeugautos auf dem Screen geschoben werden. Taschenspielplatz verschiebt das Konzept: Gerät wird gehalten, Fahrzeuge sind virtuell, die Welt ist vorgefertigt statt vom Elternteil gebaut.

## Fahrzeuge

Mehrere Fahrzeuge stehen als Requisiten in der Welt. Tap auf ein Fahrzeug → es wird aktiv und steuerbar. Alle anderen bleiben stehen, Animationen deaktiviert. Jedes Fahrzeug hat zwei Zustände mit je eigener Animation:

| Fahrzeug | Fahr-Animation | Stillstand-Animation |
|---|---|---|
| Auto | Leichtes Wackeln, Blinker | Nichts besonderes |
| Feuerwehr | Blaulicht blinkt | Wasserstrahl in Fahrtrichtung |
| Krankenwagen | Rot-blau Blaulicht wechselnd | Hecktür geht auf |
| Bagger | Schaufel oben (Erde wegfahren) | Schaufel gräbt rauf/runter |
| Abschlepper | Haken schwingt leicht | Haken senkt sich |

Geschwindigkeit variiert nach Gewicht: Auto schnell, Bagger langsam.

### Abschlepper-Mechanik

Fährt neben ein anderes Fahrzeug und hält an → Haken senkt sich → bei Nähe koppelt sich das andere Fahrzeug automatisch an. Beim Losfahren wird es mitgezogen. Kein Button, nur Nähe als Interface.

### Fahrzeug-Welt-Interaktion

Die Welt reagiert auf Fahrzeuge, verlangt aber nichts. Prinzip: Ursache und Wirkung ohne Bewertung.
- Feuerwehr sprüht Wasser auf ein Haus → Haus wird nass, Tropfen laufen runter (kein Brand, kein Problem zu lösen)
- Bagger gräbt neben Wiese → Gras-Tile wird zu Erd-Tile
- Keine "Aufgaben", keine brennenden Häuser, keine Quests. Die App will nichts vom Kind.

## Kein Sound

Bewusste Entscheidung. Die App wird im Auto und Restaurant gespielt. Eltern sollen sie ohne Angst übergeben können. Das Kind macht die Geräusche selbst — "Tatütata" kommt aus dem Kindermund.

## Welt

Tile-basiertes Grid (aktuell 20×20, langfristig 40×40+). Tiles: Gras, Straße gerade, Kurve, Kreuzung. Später: Gebäude, Bäume, Wasser, Parkplätze. Interaktive Elemente: Ampeln (Tap → Rot/Gelb/Grün cyclen).

### Architektur-Entscheidung

Die Welt ist ein reines Daten-Objekt (JSON), getrennt vom Renderer. Ob die Welt vorgefertigt, per Editor gebaut, oder prozedural generiert wird, ist noch offen — alle drei Wege sollen möglich bleiben. Der Renderer nimmt ein World-Objekt und zeichnet es, egal woher es kommt.

## Steuerung

- Tap auf Fahrzeug → wird aktiv
- Tap auf Straße → aktives Fahrzeug fährt dorthin (Pathfinding auf Straßen-Grid, BFS/A*)
- Tap neben Straße → Fahrzeug fährt zum nächsten Straßen-Tile
- Pan per Touch, optional Pinch-to-Zoom
- Kein Rückwärtsfahren (UX zu komplex für Zielgruppe)

## UI

Minimal. Kein Text (Zielgruppe kann nicht lesen). Keine Menüs, keine Popups, keine Settings. Tag/Nacht-Toggle als einziger Button. Alles andere passiert durch Interaktion mit der Welt.

## Marke

**Name:** Taschenspielplatz
**Tagline:** Spielen ohne Spielregeln.
**Ton:** Warm, ruhig, unaufgeregt. Wie ein Elternteil, das einem anderen Elternteil etwas empfiehlt.
**Kernbotschaft:** Kein Ersatz für den Spielplatz. Der Spielplatz für die Momente, in denen der echte zu weit weg ist.

## Technologie

Single HTML File, kein Build-Step, kein Framework. CSS Grid für Tiles, Web Audio API (aktuell deaktiviert wegen No-Sound-Entscheidung, aber vorbereitet), Pointer Events für Touch, CSS Transform für Pan/Zoom, localStorage für Persistenz. Viewport-Clipping für Performance bei großen Welten.

## Was definitiv nicht

- Kein Lernspiel, keine versteckte Pädagogik
- Keine Werbung, keine In-App-Käufe, keine Push-Notifications
- Keine Engagement-Tricks, keine Streaks, keine Belohnungen
- Keine Aufgaben, keine Quests, keine "richtigen" Lösungen
- Kein Ersatz für echtes Spielzeug — nur für die Lücke dazwischen