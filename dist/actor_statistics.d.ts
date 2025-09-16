declare class ActorStatistics {
    private errors;
    private saved;
    private readonly kvKey;
    private readonly logPeriod;
    constructor();
    initialize(): Promise<void>;
    loadStatistics(): Promise<void>;
    saveStatistics(): Promise<void>;
    saveError(urlString: string, error: string): void;
    incrementCounter(count: number): void;
    logStatistics(): void;
}
declare const actorStatistics: ActorStatistics;
export default actorStatistics;
//# sourceMappingURL=actor_statistics.d.ts.map