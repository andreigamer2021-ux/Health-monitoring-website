import { getSupabaseClient } from './supabase-client.js';

const DAILY_GOALS_KEY = 'health_tracker_daily_goals';
const ALL_TIME_STATS_KEY = 'health_tracker_all_time_stats';
const ALL_TIME_METRICS = [
    'steps',
    'waterIntakeLiters',
    'caloriesConsumed',
    'caloriesBurned'
];
let metadataUpdateQueue = Promise.resolve();

async function getCurrentUser() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
        throw new Error(`Could not access your account: ${error.message}`);
    }

    if (!data.user) {
        throw new Error('Sign in to save your daily goals to your account.');
    }

    return { supabase, user: data.user };
}

export async function loadDailyGoals() {
    const { user } = await getCurrentUser();
    return user.user_metadata?.[DAILY_GOALS_KEY] ?? null;
}

export async function saveDailyGoals(details) {
    return queueMetadataUpdate(() => ({ [DAILY_GOALS_KEY]: details }));
}

export async function loadAllTimeStats() {
    const { user } = await getCurrentUser();
    const savedStats = user.user_metadata?.[ALL_TIME_STATS_KEY] ?? {};

    return Object.fromEntries(ALL_TIME_METRICS.map(metric => {
        const value = Number(savedStats[metric]);
        return [metric, Number.isFinite(value) && value >= 0 ? value : 0];
    }));
}

export async function addToAllTimeStats(increments) {
    for (const [metric, amount] of Object.entries(increments)) {
        if (!ALL_TIME_METRICS.includes(metric) || !Number.isFinite(amount) || amount < 0) {
            throw new Error(`Invalid all-time stat update for ${metric}.`);
        }
    }

    return queueMetadataUpdate(userMetadata => {
        const savedStats = userMetadata[ALL_TIME_STATS_KEY] ?? {};
        const nextStats = Object.fromEntries(ALL_TIME_METRICS.map(metric => {
            const savedValue = Number(savedStats[metric]);
            const currentValue = Number.isFinite(savedValue) && savedValue >= 0
                ? savedValue
                : 0;
            return [metric, currentValue + (increments[metric] ?? 0)];
        }));

        return { [ALL_TIME_STATS_KEY]: nextStats };
    });
}

export async function resetAllTimeStats() {
    return queueMetadataUpdate(() => ({
        [ALL_TIME_STATS_KEY]: Object.fromEntries(
            ALL_TIME_METRICS.map(metric => [metric, 0])
        )
    }));
}

function queueMetadataUpdate(getUpdates) {
    const update = metadataUpdateQueue.then(async () => {
        const { supabase, user } = await getCurrentUser();
        const userMetadata = user.user_metadata ?? {};
        const updates = getUpdates(userMetadata);
        const { error } = await supabase.auth.updateUser({
            data: {
                ...userMetadata,
                ...updates
            }
        });

        if (error) {
            throw new Error(`Could not save account data: ${error.message}`);
        }
    });

    metadataUpdateQueue = update.catch(() => {});
    return update;
}
