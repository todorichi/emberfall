export function createWaveDirector() {
  let currentWave = 1;
  let waveState = 'spawning'; // spawning, combat, intermission, victory
  let spawnTimer = 0;
  let enemiesToSpawn = [];
  let intermissionTimer = 0;

  return {
    currentWave,
    waveState,
    getWaveData(wave) {
      if (wave === 5 || wave === 10) {
        return { isBoss: true, enemies: [{ type: 'boss', count: 1 }] };
      }
      const count = 6 + wave * 3;
      const list = [];
      for (let i = 0; i < count; i++) {
        const r = Math.random();
        if (wave >= 3 && r < 0.3) list.push('spitter');
        else if (wave >= 4 && r < 0.5) list.push('splitter');
        else if (wave >= 6 && r < 0.3) list.push('brute');
        else list.push('drifter');
      }
      return { isBoss: false, enemies: list };
    },
    startWave(wave) {
      this.currentWave = wave;
      this.waveState = 'combat';
      spawnTimer = 0;
    }
  };
}
