class StartupTimer {
  private startTime: number;
  private checkpoints: Map<string, number> = new Map();

  constructor() {
    this.startTime = Date.now();
    this.checkpoint("Application Start");
  }

  /**
   * Record a checkpoint
   * @param name - Name of the checkpoint
   */
  public checkpoint(name: string): void {
    this.checkpoints.set(name, Date.now());
  }

  /**
   * Get time since start
   */
  public getElapsed(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Get time between two checkpoints
   */
  public getTimeBetween(startCheckpoint: string, endCheckpoint: string): number {
    const start = this.checkpoints.get(startCheckpoint);
    const end = this.checkpoints.get(endCheckpoint);

    if (!start || !end) {
      throw new Error(`Checkpoint not found: ${start ? endCheckpoint : startCheckpoint}`);
    }

    return end - start;
  }

  /**
   * Get all checkpoint timings
   */
  public getReport(): { checkpoint: string; time: number; elapsed: number }[] {
    const report: { checkpoint: string; time: number; elapsed: number }[] = [];

    this.checkpoints.forEach((time, name) => {
      report.push({
        checkpoint: name,
        time,
        elapsed: time - this.startTime,
      });
    });

    return report.sort((a, b) => a.elapsed - b.elapsed);
  }

  /**
   * Print timing report
   */
  public printReport(): void {
    console.log("\n=== Startup Timing Report ===");
    console.log(`Total Startup Time: ${this.getElapsed()}ms\n`);

    const report = this.getReport();
    let previousTime = this.startTime;

    report.forEach(({ checkpoint, elapsed }) => {
      const diff = elapsed - (previousTime - this.startTime);
      console.log(`  ${checkpoint}: ${elapsed}ms (+${diff}ms)`);
      previousTime = elapsed + this.startTime;
    });

    console.log("============================\n");
  }
}

export default StartupTimer;
