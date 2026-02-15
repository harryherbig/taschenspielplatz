# Taschenspielplatz — Schritt 1: Engine bauen

## Kontext

Lies zuerst die Datei `CONCEPT.md` im Repo-Root — dort steht das vollständige Konzept der App. Dieses Prompt beschreibt nur den ersten Implementierungsschritt.

Ich habe ein bestehendes Repo "Toyscape" mit einer funktionierenden Tile-basierten Spielmatte (index.html). Daraus wird eine neue App: **Taschenspielplatz**. Lies die bestehende Toyscape index.html als Referenz für bewährte Patterns (Touch-Handling, Pan/Zoom, Tile-Rendering), aber bau ein komplett neues File.

## Verfügbare Assets

Im `/assets`-Ordner liegen genau diese fünf Dateien:

- `car.png` — Fahrzeug, Draufsicht
- `ground.png` — Gras-Tile
- `road.png` — Gerades Straßenstück
- `road_curved.png` — 90°-Kurve
- `road_crossroad.png` — Kreuzung

Verwende ausschließlich diese Assets. Keine weiteren Bilder erzeugen, keine Platzhalter-Grafiken, keine Inline-SVGs als Tile-Ersatz.

## Was gebaut werden soll

Ein neues `index.html` File. Single File, kein Build-Step, keine Dependencies, kein Framework.

### 1. World-Datenstruktur

Die Welt existiert als reines JavaScript-Objekt, getrennt vom Rendering:

```javascript
const world = {
  width: 20,   // Tiles
  height: 20,  // Tiles
  tileSize: XX, // Pixel — lies aus den vorhandenen Assets die tatsächliche Größe aus und verwende diese
  tiles: [
    // Jedes Tile hat x, y, type, rotation
    // type: "ground" | "road" | "road_curved" | "road_crossroad"
    // rotation: 0 | 90 | 180 | 270
  ],
  vehicles: [
    // Jedes Fahrzeug hat id, type, x, y, rotation, speed
    // Für jetzt: 5x dasselbe car.png, unterschieden durch CSS-Filter für Farbe
    { id: "car1", type: "car", x: 3, y: 5, rotation: 0, speed: 1.0, hue: 0 },
    { id: "car2", type: "car", x: 7, y: 2, rotation: 90, speed: 0.6, hue: 200 },
    { id: "car3", type: "car", x: 10, y: 8, rotation: 0, speed: 0.8, hue: 100 },
    { id: "car4", type: "car", x: 5, y: 14, rotation: 180, speed: 0.4, hue: 40 },
    { id: "car5", type: "car", x: 15, y: 10, rotation: 270, speed: 0.7, hue: 300 },
  ],
  interactives: [
    // Ampeln an Kreuzungen
    { x: 6, y: 10, type: "traffic_light", state: "red" },
  ],
  activeVehicleId: "car1",
};
```

**Wichtig:** Der Renderer liest dieses Objekt und zeichnet. Die Steuerung verändert es. Später kann ein Editor, ein Generator, oder ein JSON-File dieses Objekt erzeugen. Die Datenstruktur muss so sein, dass neue Tile-Typen und Fahrzeug-Typen durch Hinzufügen entstehen, nicht durch Umschreiben.

### 2. Straßen-Layout

Entwirf ein abwechslungsreiches 20×20 Straßennetz. Nicht eine Rennstrecke, sondern eine kleine Stadt:

- Mehrere verbundene Straßenzüge mit Kurven und Kreuzungen
- Sackgassen sind okay (Wendepunkte)
- Plätze / Loops wo man rumfahren kann
- Leere Tiles werden mit ground.png gefüllt
- Die Straßen sollen zusammenhängen (ein verbundenes Netzwerk, erreichbar von überall)
- Achte darauf, dass road_curved.png korrekt rotiert wird, damit die Straßen visuell nahtlos aneinander anschließen

### 3. Rendering

- Rendere nur Tiles die im Viewport sichtbar sind (+ 2 Tiles Buffer in jede Richtung)
- Bei 20×20 ist Performance unkritisch, aber die Architektur soll so sein, dass 60×60 ohne Umbau funktioniert
- Tiles rendern als positionierte `<img>`-Elemente oder auf Canvas — du entscheidest was besser skaliert
- Rotation per CSS `transform: rotate()`
- Die Welt ist größer als der Screen. Der Viewport zeigt einen Ausschnitt.

### 4. Pan & Zoom

- Ein-Finger-Drag: Pan (Welt verschieben)
- Zwei-Finger-Pinch: Zoom
- Alles über CSS `transform: translate() scale()` auf einem Wrapper-Div
- `preventDefault` auf Touch-Events um Browser-Zoom/Scroll zu blockieren
- Smooth, kein Ruckeln
- Beim Start: Viewport zentriert auf das aktive Fahrzeug

### 5. Fahrzeugwechsel

- Alle 5 Fahrzeuge stehen in der Welt als sichtbare Objekte
- Sie verwenden alle car.png, unterschieden durch CSS `filter: hue-rotate(XXdeg)` für verschiedene Farben
- Tap auf ein inaktives Fahrzeug → es wird aktiv (visuelles Feedback: leichtes Pulsieren oder heller Rand)
- Das vorher aktive Fahrzeug bleibt stehen wo es ist, wird inaktiv
- Nur das aktive Fahrzeug reagiert auf Fahr-Befehle

### 6. Tap-to-Drive

- Tap irgendwo auf die Welt (nicht auf ein Fahrzeug) → aktives Fahrzeug fährt dorthin
- **Pathfinding:** BFS oder A* auf dem Straßen-Grid. Das Fahrzeug bewegt sich nur auf Tiles vom Typ road, road_curved, road_crossroad
- Wenn der Tap auf ein Nicht-Straßen-Tile fällt: finde das nächstgelegene Straßen-Tile zum Tap-Punkt und fahre dorthin
- **Animation:** Smooth, Tile für Tile. Das Fahrzeug gleitet entlang des Pfads, nicht teleportieren
- **Rotation:** Das Fahrzeug dreht sich in Fahrtrichtung. Bei Kurven dreht es sich passend mit
- **Geschwindigkeit:** Unterschiedlich pro Fahrzeug (speed-Property im World-Objekt). Platzhalter für später: schwere Fahrzeuge langsam, leichte schnell
- Während ein Fahrzeug fährt und ein neuer Tap kommt: neues Ziel berechnen, Fahrzeug ändert Route

### 7. Ampeln

- An jeder Kreuzung (road_crossroad) ein visuelles Ampel-Overlay
- Kein eigenes Asset — einfache CSS/HTML-Kreise (rot/gelb/grün), positioniert an der Ecke des Kreuzungs-Tiles
- Tap auf eine Kreuzung → cyclet durch Rot → Grün → Gelb → Rot
- Visuell klar erkennbar, groß genug zum Tippen (mindestens 30px Durchmesser)
- Keine Auswirkung auf Fahrzeuge in V1 (rein visuell)

### 8. Tag/Nacht

- Ein Toggle-Button, Position: oberer rechter Rand
- Icon: ☀️ / 🌙 (Emoji reicht)
- Nacht: CSS `filter: brightness(0.4)` auf der Welt + blauer Farbton
- Ampeln leuchten nachts stärker (höhere Opacity oder `box-shadow` Glow)
- Zustand in localStorage speichern

### 9. UI

- **Kein Text** auf dem Screen außer dem App-Namen "Taschenspielplatz" oben links, klein und dezent, halbtransparent
- **Tag/Nacht Button** oben rechts, min 44×44px Tap-Target
- **Kein Hupe-Button** (kommt erst wenn Sounds implementiert werden)
- **Kein Menü, keine Popups, keine Modals, kein Onboarding**
- Hintergrund hinter der Welt (beim Rauszoomen sichtbar): sanftes Grün passend zu ground.png

### 10. Kein Sound

Bewusste Design-Entscheidung. Keine Web Audio API, keine Sound-Engine, keine Audio-Elemente. Die App ist lautlos. Kommt eventuell als optionales Feature später. Bau keine Sound-Infrastruktur vor.

### 11. Persistenz

- localStorage: Komplettes World-Objekt speichern bei jeder Änderung (Fahrzeugpositionen, Ampel-Zustände, aktives Fahrzeug, Tag/Nacht)
- Beim Laden: World aus localStorage wiederherstellen, falls vorhanden. Sonst Default-Layout.
- Reset-Möglichkeit: Kein expliziter Button, aber `localStorage.clear()` in der Konsole soll reichen für Entwicklung

### 12. Touch-Handling — Wichtig

Die Zielgruppe tippt mit kleinen Kinderfingern auf einem Smartphone. Jeder Touch muss eindeutig zugeordnet werden:

- **Tap auf Fahrzeug** → Fahrzeugwechsel (kein Fahren)
- **Tap auf Welt** → Fahren
- **Tap auf Ampel** → Ampel schalten
- **Drag** → Pan
- **Pinch** → Zoom

Das heißt: ein kurzer Tap muss von einem Drag unterschieden werden. Verwende einen Schwellwert (z.B. 10px Bewegung oder 200ms Dauer) um Tap von Drag zu trennen. Pointer Events API für unified Touch/Mouse.

Priorisierung bei Überlappung: Fahrzeug-Tap > Ampel-Tap > Welt-Tap. Wenn ein Fahrzeug auf einer Kreuzung steht, gewinnt das Fahrzeug.

## Was du NICHT bauen sollst

- Keine Fahrzeug-Animationen (Blaulicht, Wasserstrahl, Schaufel) — kommen mit den richtigen Assets
- Keine Fahrzeug-Welt-Interaktionen (Haus nass sprühen, Erde baggern) — kommen später
- Keine Abschlepper-Ankoppel-Mechanik — kommt später
- Keinen Edit-Mode
- Keinen Welt-Generator
- Keine Sound-Engine
- Kein Menü, keine Settings

## Definition of Done

Die App ist fertig wenn:

1. Man sieht eine 20×20 Welt mit Straßen und Gras
2. 5 verschiedenfarbige Autos stehen in der Welt
3. Tap auf ein Auto → es wird aktiv (visuelles Feedback)
4. Tap auf die Straße → aktives Auto fährt den Pfad entlang dorthin
5. Das Auto fährt nur auf Straßen, nicht über Gras
6. Das Auto dreht sich in Fahrtrichtung
7. Man kann die Welt pannen und zoomen
8. Ampeln an Kreuzungen lassen sich durchschalten
9. Tag/Nacht Toggle funktioniert
10. Alles fühlt sich smooth an auf einem Smartphone (Chrome Android / Safari iOS)
11. Kein Sound
12. Zustand bleibt nach Reload erhalten