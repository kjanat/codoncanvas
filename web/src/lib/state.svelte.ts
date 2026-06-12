// App-wide shared state: the genome currently being edited, so the gallery and
// mutation lab can hand a genome to the playground.

const DEFAULT_GENOME = `; Negative Offset Demo — satellites around a center circle.
; The left and up satellites are only reachable thanks to the
; signed-TRANSLATE fix (32 = stay put, <32 = left/up, >32 = right/down).
ATG
GAA GGG GAA TTT GAA GAA TTA  ; blue color
GAA AGG GGA                  ; center circle
TCA
GAA TCA GAA GAA ACA          ; translate right
GAA ACG GGA
TCG
TCA
GAA ATA GAA GAA ACA          ; translate LEFT
GAA ACG GGA
TCG
TCA
GAA GAA GAA TCA ACA          ; translate down
GAA ACG GGA
TCG
TCA
GAA GAA GAA ATA ACA          ; translate UP
GAA ACG GGA
TAA`;

class GenomeStore {
  value = $state(DEFAULT_GENOME);

  set(genome: string): void {
    this.value = genome;
  }
}

export const genomeStore = new GenomeStore();
