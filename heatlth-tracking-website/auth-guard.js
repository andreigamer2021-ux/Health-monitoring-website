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

        const accountStatus = document.getElementById('account-status');
        const profilePhoto = document.querySelector('#profile-menu-toggle img');
        const profileOptions = document.getElementById('profile-picture-options');
        const profileStorageKey = `health-tracker-profile-picture:${data.session.user.id}`;
        const produceAvatars = [
            {
                name: 'Strawberry', background: '#fff0f2', faceY: 51,
                art: '<path d="M48 77C39 68 23 54 25 40c2-17 20-22 29-11 10-11 28-6 29 11 2 14-14 28-35 37z" fill="#ed5262"/><path d="M48 34c-8-13-17-13-20-12 3 7 9 12 18 14-3-10-1-16 2-20 5 5 7 11 6 20 6-9 12-11 18-10-2 7-8 12-18 14" fill="#43a66b"/><g fill="#ffd86b"><ellipse cx="37" cy="45" rx="1.5" ry="2.5"/><ellipse cx="58" cy="43" rx="1.5" ry="2.5"/><ellipse cx="44" cy="62" rx="1.5" ry="2.5"/><ellipse cx="62" cy="57" rx="1.5" ry="2.5"/></g>'
            },
            {
                name: 'Orange', background: '#fff3df', faceY: 53,
                art: '<circle cx="48" cy="53" r="29" fill="#f59b27"/><path d="M48 25c1-8 6-12 13-12-2 7-6 11-13 13" fill="#48a95e"/><path d="M47 25c-4-6-9-7-14-6 3 5 7 7 14 7" fill="#67bd69"/><path d="M31 37q8-8 16-5M66 41q-4-6-9-7" fill="none" stroke="#ffc65c" stroke-width="3" stroke-linecap="round"/>'
            },
            {
                name: 'Apple', background: '#fce9e8', faceY: 53,
                art: '<path d="M48 31c-19-16-36-2-33 20 3 21 17 31 33 24 16 7 30-3 33-24 3-22-14-36-33-20z" fill="#e94f55"/><path d="M48 32c-2-11 3-17 11-20 1 8-2 14-11 20" fill="#79502f"/><path d="M49 26c4-10 13-12 21-8-5 7-12 10-21 8" fill="#46a964"/><path d="M26 44q4-7 10-8" fill="none" stroke="#ff9a87" stroke-width="4" stroke-linecap="round"/>'
            },
            {
                name: 'Pear', background: '#f3f6df', faceY: 55,
                art: '<path d="M48 21c-2 14-5 19-14 28-18 20-7 36 14 36s32-16 14-36c-9-9-12-14-14-28z" fill="#a9cb4b"/><path d="M48 24c-2-8 1-13 7-16" fill="none" stroke="#79502f" stroke-width="5" stroke-linecap="round"/><path d="M51 18c6-8 14-8 20-4-5 7-12 9-20 4" fill="#4da665"/><circle cx="36" cy="68" r="2" fill="#8bb33c"/><circle cx="64" cy="62" r="2" fill="#8bb33c"/>'
            },
            {
                name: 'Watermelon', background: '#e6f6e9', faceY: 61,
                art: '<path d="M15 31a39 39 0 0 0 66 0z" fill="#51ae68"/><path d="M21 32a33 33 0 0 0 54 0z" fill="#f7e8b4"/><path d="M25 33a29 29 0 0 0 46 0z" fill="#f26b73"/><g fill="#523b39"><ellipse cx="38" cy="45" rx="2" ry="4" transform="rotate(-20 38 45)"/><ellipse cx="58" cy="45" rx="2" ry="4" transform="rotate(20 58 45)"/><ellipse cx="48" cy="52" rx="2" ry="4"/></g>'
            },
            {
                name: 'Banana', background: '#fff7d8', faceY: 53,
                art: '<path d="M22 31c7 25 25 39 47 34 7-2 11-6 13-12-8 4-14 3-20-1-15-8-22-23-26-31z" fill="#f4c842" stroke="#d89e26" stroke-width="3" stroke-linejoin="round"/><path d="M22 31l5-5 7 1-1 7-6 4M80 53l7-3 2 6-7 4" fill="#79502f"/><path d="M31 38q9 18 23 23" fill="none" stroke="#ffe681" stroke-width="4" stroke-linecap="round"/>'
            },
            {
                name: 'Carrot', background: '#fff0df', faceY: 48,
                art: '<path d="M29 31c13-8 34-7 43 4L49 81z" fill="#f28a32"/><path d="M37 31c-4-11-2-18 4-24 4 8 4 15 3 22 4-12 10-17 18-17-1 10-6 17-16 22 11-7 19-7 26-2-7 8-17 10-30 6" fill="#48a967"/><path d="M38 46l5 2M58 46l5-2M44 57q5 4 10 0" fill="none" stroke="#cf6926" stroke-width="2" stroke-linecap="round"/>'
            },
            {
                name: 'Avocado', background: '#eaf5dc', faceY: 43,
                art: '<path d="M48 16c-8 0-12 10-15 20-3 9-16 25-13 39 3 17 24 19 38 11 15-8 22-24 12-38-8-11-11-32-22-32z" fill="#4b9a58"/><path d="M48 23c-6 0-9 10-12 19-3 9-12 21-10 32 2 11 16 13 27 7 12-6 17-19 10-29-7-9-8-29-15-29z" fill="#b7d978"/><circle cx="49" cy="62" r="12" fill="#94613e"/><circle cx="45" cy="57" r="3" fill="#c38a55"/>'
            },
            {
                name: 'Broccoli', background: '#e6f4e5', faceY: 43,
                art: '<path d="M39 52h18l5 28H34z" fill="#83b94d"/><circle cx="34" cy="40" r="15" fill="#31965b"/><circle cx="49" cy="31" r="17" fill="#25864f"/><circle cx="64" cy="41" r="15" fill="#31965b"/><circle cx="45" cy="42" r="14" fill="#3da765"/><circle cx="31" cy="37" r="4" fill="#67c879"/><circle cx="51" cy="27" r="4" fill="#67c879"/><circle cx="66" cy="37" r="4" fill="#67c879"/>'
            },
            {
                name: 'Eggplant', background: '#f0e9f7', faceY: 54,
                art: '<path d="M38 30c14-12 33-4 36 11 4 19-18 38-35 38-13 0-22-11-19-24 2-10 9-19 18-25z" fill="#8251a0"/><path d="M40 29c-5-9-2-17 4-22 4 7 5 13 2 19 7-8 14-10 22-6-4 8-12 12-22 12-3 0-5-1-6-3z" fill="#4c9a58"/><path d="M32 39q-6 7-8 14" fill="none" stroke="#aa7ac1" stroke-width="4" stroke-linecap="round"/>'
            },
            {
                name: 'Tomato', background: '#fde9e1', faceY: 54,
                art: '<path d="M48 28c-8-8-19-5-25 2-14 15-6 45 25 47 31-2 39-32 25-47-6-7-17-10-25-2z" fill="#ec5a48"/><path d="M48 31c-2-10-9-14-17-13 2 8 7 12 15 14-4-8-2-15 2-20 5 6 6 12 3 20 7-7 14-8 21-4-5 7-12 9-22 6" fill="#479b58"/><path d="M29 44q4-6 8-7" fill="none" stroke="#ff9b73" stroke-width="4" stroke-linecap="round"/>'
            },
            {
                name: 'Corn', background: '#fff5cf', faceY: 49,
                art: '<path d="M34 24c-5 11-6 37 2 54 8 8 17 8 25 0 8-17 7-43 2-54-8-7-21-7-29 0z" fill="#f4c744"/><path d="M34 30l28 34M31 42l31 29M62 30L34 64M65 42L36 72" stroke="#e6a932" stroke-width="3"/><path d="M35 72c-13 4-18 0-21-8 11 2 17 4 21 8M61 72c13 4 18 0 21-8-11 2-17 4-21 8" fill="#55a967"/><path d="M40 21c0-8 4-12 8-15 4 3 8 7 8 15" fill="#5caf62"/>'
            }
        ];

        function makeAvatar(avatar) {
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
                <rect width="96" height="96" rx="48" fill="${avatar.background}"/>
                ${avatar.art}
                <circle cx="41" cy="${avatar.faceY}" r="2" fill="#342a25"/>
                <circle cx="55" cy="${avatar.faceY}" r="2" fill="#342a25"/>
                <path d="M43 ${avatar.faceY + 7}q5 4 10 0" fill="none" stroke="#743f32" stroke-width="2" stroke-linecap="round"/>
                <circle cx="35" cy="${avatar.faceY + 5}" r="2.5" fill="#f28c8c" opacity=".65"/>
                <circle cx="61" cy="${avatar.faceY + 5}" r="2.5" fill="#f28c8c" opacity=".65"/>
            </svg>`;
            return `data:image/svg+xml,${encodeURIComponent(svg)}`;
        }

        const avatarSources = produceAvatars.map(makeAvatar);
        let selectedAvatar = 0;

        try {
            const storedAvatar = Number(localStorage.getItem(profileStorageKey));
            if (Number.isInteger(storedAvatar) && storedAvatar >= 0 && storedAvatar < avatarSources.length) {
                selectedAvatar = storedAvatar;
            }
        } catch (storageError) {
            accountStatus.textContent = `Could not load the saved profile picture: ${storageError.message}`;
        }

        function selectAvatar(index, saveSelection = true) {
            selectedAvatar = index;
            profilePhoto.src = avatarSources[index];
            profilePhoto.alt = `${produceAvatars[index].name} profile picture`;
            profileOptions.querySelectorAll('.profile-picture-option').forEach((option, optionIndex) => {
                option.setAttribute('aria-pressed', String(optionIndex === index));
            });

            if (saveSelection) {
                try {
                    localStorage.setItem(profileStorageKey, String(index));
                    accountStatus.textContent = 'Profile picture updated.';
                } catch (storageError) {
                    accountStatus.textContent =
                        `Profile picture changed for this page, but could not be saved: ${storageError.message}`;
                }
            }
        }

        avatarSources.forEach((source, index) => {
            const option = document.createElement('button');
            option.className = 'profile-picture-option';
            option.type = 'button';
            option.setAttribute('aria-label', `Choose ${produceAvatars[index].name} profile picture`);
            option.setAttribute('aria-pressed', 'false');

            const image = document.createElement('img');
            image.src = source;
            image.alt = '';
            option.append(image);
            option.addEventListener('click', () => selectAvatar(index));
            profileOptions.append(option);
        });
        selectAvatar(selectedAvatar, false);

        const menuToggle = document.getElementById('profile-menu-toggle');
        const accountMenu = document.getElementById('account-menu');

        function setAccountMenuOpen(isOpen) {
            accountMenu.hidden = !isOpen;
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        }

        menuToggle.addEventListener('click', () => {
            setAccountMenuOpen(accountMenu.hidden);
        });

        const profilePicturesDialog = document.getElementById('profile-pictures-dialog');
        document.getElementById('open-profile-pictures').addEventListener('click', () => {
            setAccountMenuOpen(false);
            profilePicturesDialog.showModal();
        });

        document.getElementById('open-stats').addEventListener('click', () => {
            window.location.assign('stats.html');
        });

        document.getElementById('open-favorites').addEventListener('click', () => {
            setAccountMenuOpen(false);
            if (document.getElementById('favorite-recipes-dialog')) {
                document.dispatchEvent(new Event('open-favorite-recipes'));
                return;
            }
            window.location.assign('dashboard.html#favorite-recipes');
        });

        document.getElementById('close-profile-dialog').addEventListener('click', () => {
            profilePicturesDialog.close();
            menuToggle.focus();
        });

        document.addEventListener('click', event => {
            if (!event.target.closest('.account-menu-container')) {
                setAccountMenuOpen(false);
            }
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && !accountMenu.hidden) {
                setAccountMenuOpen(false);
                menuToggle.focus();
            }
        });

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
