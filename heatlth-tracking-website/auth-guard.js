import { getSupabaseClient } from './supabase-client.js';

try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        throw new Error(`Could not verify your sign-in: ${error.message}`);
    }

    if (!data.session) {
        window.location.replace('auth.html');
    } else {
        document.getElementById('user-email').textContent = data.session.user.email;
        document.body.hidden = false;

        document.getElementById('sign-out').addEventListener('click', async () => {
            try {
                const { error: signOutError } = await supabase.auth.signOut();
                if (signOutError) {
                    document.getElementById('account-status').textContent =
                        `Could not sign out: ${signOutError.message}`;
                    return;
                }

                window.location.assign('auth.html');
            } catch (signOutError) {
                document.getElementById('account-status').textContent =
                    `Could not connect to sign out: ${signOutError.message}`;
            }
        });
    }
} catch (error) {
    window.location.replace(`auth.html?error=${encodeURIComponent(error.message)}`);
}
