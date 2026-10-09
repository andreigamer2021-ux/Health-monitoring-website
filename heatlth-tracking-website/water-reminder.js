const NEXT_REMINDER_KEY = 'health-tracker-next-water-reminder';
const SETTINGS_STORAGE_KEY = 'health-tracker-website-settings';
const DEFAULT_INTERVAL_MINUTES = 30;

const dialog = document.createElement('dialog');
dialog.className = 'water-reminder-dialog';
dialog.setAttribute('aria-labelledby', 'water-reminder-title');
dialog.innerHTML = `
    <svg class="water-reminder-bottle" viewBox="0 0 64 80" aria-hidden="true">
        <path d="M24 5h16v10l5 6v48a5 5 0 0 1-5 5H24a5 5 0 0 1-5-5V21l5-6z"
            fill="#e5f5ff" stroke="#2879a8" stroke-width="3" stroke-linejoin="round"/>
        <path d="M24 5h16v10H24z" fill="#56a9d4" stroke="#2879a8" stroke-width="3"/>
        <path d="M20 42h24v24a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4z"
            fill="#74c9ec"/>
        <path d="M26 49h12" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
    </svg>
    <h2 id="water-reminder-title">Time to drink some water!</h2>
    <p>Take a moment to have a drink and stay hydrated.</p>
    <button class="water-reminder-dismiss" type="button">Got it</button>
`;
document.body.append(dialog);

const dismissButton = dialog.querySelector('.water-reminder-dismiss');

function reportStorageError(error) {
    const accountStatus = document.getElementById('account-status');
    if (accountStatus) {
        accountStatus.textContent =
            `Water reminders may not continue between pages: ${error.message}`;
    }
}

function saveNextReminder(timestamp) {
    try {
        sessionStorage.setItem(NEXT_REMINDER_KEY, String(timestamp));
    } catch (error) {
        reportStorageError(error);
    }
}

function getReminderSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || '{}');
        const interval = Number(settings.waterReminderIntervalMinutes);
        return {
            enabled: settings.waterRemindersEnabled !== false,
            intervalMs: (Number.isFinite(interval) && interval > 0
                ? interval
                : DEFAULT_INTERVAL_MINUTES) * 60 * 1000
        };
    } catch (error) {
        reportStorageError(error);
        return { enabled: true, intervalMs: DEFAULT_INTERVAL_MINUTES * 60 * 1000 };
    }
}

let reminderTimer;
function scheduleReminder(timestamp) {
    window.clearTimeout(reminderTimer);
    const settings = getReminderSettings();
    if (!settings.enabled) {
        try {
            sessionStorage.removeItem(NEXT_REMINDER_KEY);
        } catch (error) {
            reportStorageError(error);
        }
        return;
    }

    saveNextReminder(timestamp);
    const delay = Math.max(timestamp - Date.now(), 0);
    reminderTimer = window.setTimeout(() => {
        saveNextReminder(Date.now() + settings.intervalMs);
        if (!dialog.open) {
            dialog.showModal();
        }
    }, delay);
}

dismissButton.addEventListener('click', () => {
    dialog.close();
    const settings = getReminderSettings();
    scheduleReminder(Date.now() + settings.intervalMs);
});

window.addEventListener('website-settings-changed', event => {
    if (!event.detail.waterRemindersEnabled) {
        dialog.close();
        scheduleReminder(Date.now());
        return;
    }

    scheduleReminder(Date.now() + event.detail.waterReminderIntervalMinutes * 60 * 1000);
});

let nextReminder;
try {
    nextReminder = Number(sessionStorage.getItem(NEXT_REMINDER_KEY));
} catch (error) {
    reportStorageError(error);
}

if (Number.isFinite(nextReminder) && nextReminder > 0) {
    scheduleReminder(nextReminder);
} else {
    scheduleReminder(Date.now() + getReminderSettings().intervalMs);
}
