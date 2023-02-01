import { Actor } from 'apify';
import { EventType, log } from 'crawlee';
import { LOGGING_PERIOD, STATISTICS_KEY } from './constants.js';

interface PersistedStatistics {
    errors: Record<string, string[]>,
    saved: number
}

class ActorStatistics {
    private errors: Record<string, string[]>;
    private saved;
    private readonly kvKey;
    private readonly logPeriod;

    constructor() {
        this.errors = {};
        this.saved = 0;
        this.kvKey = STATISTICS_KEY;
        this.logPeriod = LOGGING_PERIOD;
    }

    async initialize() {
        await Actor.init();
        await this.loadStatistics();

        Actor.on(EventType.PERSIST_STATE, async () => {
            await this.saveStatistics();
        });

        if (this.logPeriod) {
            setInterval(() => this.logStatistics(), this.logPeriod * 1000);
        }
    }

    async loadStatistics() {
        const loadedStatistics = (await Actor.getValue(this.kvKey)) as PersistedStatistics;
        if (!loadedStatistics) return;

        this.errors = loadedStatistics.errors;
        this.saved = loadedStatistics.saved;
    }

    async saveStatistics() {
        const statisticsToPersist: PersistedStatistics = {
            errors: this.errors,
            saved: this.saved,
        };
        await Actor.setValue(this.kvKey, statisticsToPersist);
    }

    saveError(urlString: string, error: string) {
        const url = new URL(urlString);
        const path = url.pathname;

        if (!this.errors[path]) this.errors[path] = [];
        this.errors[path].push(error.toString());
    }

    incrementCounter(count: number) {
        this.saved += count;
    }

    logStatistics() {
        log.info('---- statistics state: ----');
        log.info(JSON.stringify({
            totalSaved: this.saved,
            errors: this.errors,
        }));
    }
}

const actorStatistics = new ActorStatistics();
await actorStatistics.initialize();

export default actorStatistics;
