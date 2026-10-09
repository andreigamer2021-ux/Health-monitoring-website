import { loadWebsiteSettings, saveWebsiteSettings } from './website-settings.js';

const settingsDialog = document.createElement('dialog');
settingsDialog.className = 'profile-dialog website-settings-dialog';
settingsDialog.setAttribute('aria-labelledby', 'website-settings-title');
settingsDialog.innerHTML = `
    <div class="profile-dialog-header">
        <h2 id="website-settings-title">Website settings</h2>
        <button class="profile-dialog-close" type="button" aria-label="Close settings">
            &times;
        </button>
    </div>
    <p class="settings-error" role="status" aria-live="polite"></p>
    <form class="website-settings-form">
        <label class="website-setting">
            <span>Water reminders</span>
            <input name="waterRemindersEnabled" type="checkbox">
        </label>
        <label class="website-setting website-setting-interval">
            <span>Remind me every</span>
            <select name="waterReminderIntervalMinutes">
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
            </select>
        </label>
        <label class="website-setting">
            <span>Dark mode</span>
            <input name="darkModeEnabled" type="checkbox">
        </label>
        <div class="website-settings-actions">
            <button class="settings-cancel" type="button">Cancel</button>
            <button class="settings-save" type="submit">Save settings</button>
        </div>
    </form>
`;
document.body.append(settingsDialog);

const settingsForm = settingsDialog.querySelector('.website-settings-form');
const settingsError = settingsDialog.querySelector('.settings-error');
const reminderToggle = settingsForm.elements.namedItem('waterRemindersEnabled');
const reminderInterval = settingsForm.elements.namedItem('waterReminderIntervalMinutes');
const darkModeToggle = settingsForm.elements.namedItem('darkModeEnabled');

function applyDarkMode(enabled) {
    document.body.classList.toggle('dark-mode', enabled);
}

function fillSettingsForm(settings) {
    reminderToggle.checked = settings.waterRemindersEnabled;
    reminderInterval.value = String(settings.waterReminderIntervalMinutes);
    darkModeToggle.checked = settings.darkModeEnabled;
}

try {
    applyDarkMode(loadWebsiteSettings().darkModeEnabled);
} catch (error) {
    settingsError.textContent = `Could not load website settings: ${error.message}`;
}

document.getElementById('open-settings').addEventListener('click', () => {
    try {
        const settings = loadWebsiteSettings();
        fillSettingsForm(settings);
        reminderInterval.disabled = !settings.waterRemindersEnabled;
        settingsError.textContent = '';
    } catch (error) {
        settingsError.textContent = `Could not load website settings: ${error.message}`;
    }

    settingsDialog.showModal();
});

settingsDialog.querySelector('.profile-dialog-close').addEventListener('click', () => {
    settingsDialog.close();
});

settingsDialog.querySelector('.settings-cancel').addEventListener('click', () => {
    settingsDialog.close();
});

reminderToggle.addEventListener('change', () => {
    reminderInterval.disabled = !reminderToggle.checked;
});

settingsForm.addEventListener('submit', event => {
    event.preventDefault();
    try {
        const settings = saveWebsiteSettings({
            waterRemindersEnabled: reminderToggle.checked,
            waterReminderIntervalMinutes: Number(reminderInterval.value),
            darkModeEnabled: darkModeToggle.checked
        });
        applyDarkMode(settings.darkModeEnabled);
        window.dispatchEvent(new CustomEvent('website-settings-changed', {
            detail: settings
        }));
        settingsDialog.close();
    } catch (error) {
        settingsError.textContent = `Could not save website settings: ${error.message}`;
    }
});
