export const SETTINGS_STORAGE_KEY = 'health-tracker-website-settings';

export const DEFAULT_SETTINGS = {
    waterRemindersEnabled: true,
    waterReminderIntervalMinutes: 30,
    darkModeEnabled: false
};

export function loadWebsiteSettings() {
    const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!storedSettings) {
        return { ...DEFAULT_SETTINGS };
    }

    const parsedSettings = JSON.parse(storedSettings);
    const interval = Number(parsedSettings.waterReminderIntervalMinutes);

    return {
        waterRemindersEnabled: typeof parsedSettings.waterRemindersEnabled === 'boolean'
            ? parsedSettings.waterRemindersEnabled
            : DEFAULT_SETTINGS.waterRemindersEnabled,
        waterReminderIntervalMinutes: [15, 30, 60].includes(interval)
            ? interval
            : DEFAULT_SETTINGS.waterReminderIntervalMinutes,
        darkModeEnabled: typeof parsedSettings.darkModeEnabled === 'boolean'
            ? parsedSettings.darkModeEnabled
            : DEFAULT_SETTINGS.darkModeEnabled
    };
}

export function saveWebsiteSettings(settings) {
    const validatedSettings = {
        waterRemindersEnabled: Boolean(settings.waterRemindersEnabled),
        waterReminderIntervalMinutes: [15, 30, 60].includes(
            Number(settings.waterReminderIntervalMinutes)
        )
            ? Number(settings.waterReminderIntervalMinutes)
            : DEFAULT_SETTINGS.waterReminderIntervalMinutes,
        darkModeEnabled: Boolean(settings.darkModeEnabled)
    };

    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(validatedSettings));
    return validatedSettings;
}
