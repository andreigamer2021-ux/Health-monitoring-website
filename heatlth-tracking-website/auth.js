import { getSupabaseClient } from './supabase-client.js';

const status = document.getElementById('auth-status');
const authForm = document.getElementById('auth-form');
const modeButton = document.getElementById('toggle-auth-mode');
const submitButton = document.getElementById('auth-submit');
const passwordInput = document.getElementById('password');
let isSignUp = false;
let supabase;

function showStatus(message, isError = false) {
    status.textContent = message;
    status.dataset.error = String(isError);
}

const authError = new URLSearchParams(window.location.search).get('error');
if (authError) {
    showStatus(authError, true);
}

try {
    supabase = getSupabaseClient();
} catch (error) {
    showStatus(error.message, true);
    authForm.hidden = true;
    modeButton.hidden = true;
}

if (supabase) {
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            showStatus(`Could not check your session: ${error.message}`, true);
        } else if (data.session) {
            window.location.replace('index.html');
        }
    } catch (error) {
        showStatus(`Could not connect to Supabase: ${error.message}`, true);
    }
}

modeButton.addEventListener('click', () => {
    isSignUp = !isSignUp;
    submitButton.textContent = isSignUp ? 'Create account' : 'Sign in';
    modeButton.textContent = isSignUp
        ? 'Already have an account? Sign in'
        : 'Need an account? Sign up';
    passwordInput.autocomplete = isSignUp ? 'new-password' : 'current-password';
    showStatus('');
});

authForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!supabase) {
        return;
    }

    submitButton.disabled = true;
    showStatus(isSignUp ? 'Creating your account…' : 'Signing in…');

    const email = document.getElementById('email').value.trim();
    const password = passwordInput.value;
    try {
        const result = isSignUp
            ? await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: new URL('index.html', window.location.href).href
                }
            })
            : await supabase.auth.signInWithPassword({ email, password });

        if (result.error) {
            showStatus(result.error.message, true);
            return;
        }

        if (isSignUp && !result.data.session) {
            showStatus('Account created. Check your email to confirm it, then sign in.');
            return;
        }

        window.location.assign('index.html');
    } catch (error) {
        showStatus(`Could not connect to Supabase: ${error.message}`, true);
    } finally {
        submitButton.disabled = false;
    }
});
