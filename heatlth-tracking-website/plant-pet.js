const pet = document.createElement('div');
pet.className = 'plant-pet';
pet.setAttribute('aria-hidden', 'true');
pet.innerHTML = `
    <img src="carnivours-plant.svg" alt="">
    <span class="plant-pet-drink-progress" aria-hidden="true">
        <span class="plant-pet-drink-progress-fill"></span>
    </span>
    <span class="plant-pet-hearts" aria-hidden="true"></span>
`;
document.body.append(pet);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const edge = 12;
const gravity = 1500;
const jumpVelocity = -650;
const walkingSpeed = 52;
const walkingAcceleration = 190;
const bottlesPerProgressCycle = 10;
let bottlesFed = 0;
const state = {
    x: edge,
    y: -100,
    velocityX: 0,
    velocityY: 0,
    targetX: edge,
    nextActionAt: 0,
    lastFrameAt: performance.now(),
    grounded: false,
    platform: null,
    pointerDown: false,
    dragging: false,
    pointerOffsetX: 0,
    pointerOffsetY: 0,
    lastPointerX: 0,
    lastPointerY: 0,
    lastPointerAt: 0,
    pointerStartX: 0,
    pointerStartY: 0,
    animationFrameStarted: false
};

function floorPlatform() {
    return {
        type: 'floor',
        element: null,
        left: 0,
        right: window.innerWidth,
        top: window.innerHeight
    };
}

function pagePlatforms() {
    return Array.from(document.querySelectorAll(
        '.table-container table, .summary-container .card'
    ))
        .map(element => {
            const bounds = element.getBoundingClientRect();
            return {
                type: element.matches('.card') ? 'card' : 'table',
                element,
                left: Math.max(0, bounds.left),
                right: Math.min(window.innerWidth, bounds.right),
                top: bounds.top
            };
        })
        .filter(platform =>
            platform.right - platform.left >= pet.offsetWidth * 0.7 &&
            platform.top >= 0 &&
            platform.top < window.innerHeight - pet.offsetHeight
        )
        .sort((first, second) => first.top - second.top);
}

function renderPet() {
    pet.style.left = `${state.x}px`;
    pet.style.top = `${state.y}px`;
    pet.classList.toggle('plant-pet-facing-left', state.velocityX < -1);
    pet.classList.toggle(
        'plant-pet-walking',
        state.grounded && Math.abs(state.velocityX) > 5
    );
    pet.classList.toggle('plant-pet-airborne', !state.grounded);
    pet.classList.toggle('plant-pet-wall-left', state.platform?.type === 'wall' &&
        state.platform.side === 'left');
    pet.classList.toggle('plant-pet-wall-right', state.platform?.type === 'wall' &&
        state.platform.side === 'right');
    const direction = state.velocityX < -1 ? '-1' : '1';
    pet.style.setProperty('--pet-facing', direction);
    pet.style.setProperty('--pet-walk-drift', direction === '-1' ? '-5px' : '5px');
}

function startAnimationFrame() {
    if (!state.animationFrameStarted) {
        state.animationFrameStarted = true;
        window.requestAnimationFrame(animatePet);
    }
}

function landOn(platform, now) {
    state.y = platform.top - pet.offsetHeight;
    state.velocityY = 0;
    state.velocityX = 0;
    state.grounded = true;
    state.platform = platform;
    state.targetX = state.x;
    state.nextActionAt = now + 800 + Math.random() * 1700;
    state.targetY = state.y;
}

function wallPositionX(side) {
    const rotatedInset = Math.max(0, (pet.offsetHeight - pet.offsetWidth) / 2);
    const left = side === 'left'
        ? edge + rotatedInset
        : window.innerWidth - pet.offsetWidth - edge - rotatedInset;
    return Math.max(0, Math.min(window.innerWidth - pet.offsetWidth, left));
}

function startWallClimb(now) {
    const side = Math.random() < 0.5 ? 'left' : 'right';
    state.platform = {
        type: 'wall',
        side,
        element: null,
        left: 0,
        right: window.innerWidth,
        top: 0
    };
    state.x = wallPositionX(side);
    state.velocityX = 0;
    state.velocityY = 0;
    state.targetY = Math.max(30, Math.random() * (floorPlatform().top - pet.offsetHeight));
    state.nextActionAt = now + 1800 + Math.random() * 2200;
    return true;
}

function startJump(now) {
    const platforms = pagePlatforms().filter(platform =>
        !state.platform?.element || platform.element !== state.platform.element
    );
    const choices = [];

    for (const platform of platforms) {
        const lowestX = Math.max(edge, platform.left);
        const highestX = Math.min(
            window.innerWidth - pet.offsetWidth - edge,
            platform.right - pet.offsetWidth
        );
        if (highestX < lowestX) {
            continue;
        }

        const landingX = lowestX + Math.random() * (highestX - lowestX);
        const verticalDistance = platform.top - pet.offsetHeight - state.y;
        const discriminant = jumpVelocity ** 2 + 2 * gravity * verticalDistance;
        if (discriminant < 0) {
            continue;
        }

        const flightTime = (-jumpVelocity + Math.sqrt(discriminant)) / gravity;
        const horizontalVelocity = (landingX - state.x) / flightTime;
        if (flightTime > 0 && Math.abs(horizontalVelocity) <= 260) {
            choices.push({ platform, landingX, horizontalVelocity });
        }
    }

    if (choices.length === 0) {
        state.nextActionAt = now + 1000 + Math.random() * 1500;
        return false;
    }

    const choice = choices[Math.floor(Math.random() * choices.length)];
    state.velocityX = choice.horizontalVelocity;
    state.velocityY = jumpVelocity;
    state.targetX = choice.landingX;
    state.platform = null;
    state.grounded = false;
    return true;
}

function walkOnPlatform(elapsed, now) {
    const platform = state.platform ?? floorPlatform();
    if (platform.type === 'wall') {
        const floorY = Math.max(0, window.innerHeight - pet.offsetHeight);
        if (now >= state.nextActionAt) {
            if (state.y >= floorY - 2 && Math.random() < 0.5) {
                state.platform = floorPlatform();
                state.y = floorY;
                state.x = platform.side === 'left'
                    ? edge
                    : Math.max(edge, window.innerWidth - pet.offsetWidth - edge);
                state.nextActionAt = now + 900 + Math.random() * 1800;
                return;
            }

            state.targetY = Math.max(
                24,
                Math.min(floorY, Math.random() * floorY)
            );
            state.nextActionAt = now + 1400 + Math.random() * 2200;
        }

        const verticalDistance = state.targetY - state.y;
        const desiredVerticalSpeed = Math.sign(verticalDistance) * Math.min(
            walkingSpeed,
            Math.sqrt(2 * walkingAcceleration * Math.abs(verticalDistance))
        );
        const speedChange = walkingAcceleration * elapsed;
        state.velocityY += Math.max(
            -speedChange,
            Math.min(speedChange, desiredVerticalSpeed - state.velocityY)
        );
        const nextY = state.y + state.velocityY * elapsed;
        if (Math.sign(verticalDistance) !== Math.sign(state.targetY - nextY) ||
            Math.abs(state.targetY - nextY) < 1) {
            state.y = state.targetY;
            state.velocityY = 0;
        } else {
            state.y = Math.max(0, Math.min(floorY, nextY));
        }
        state.x = wallPositionX(platform.side);
        return;
    }

    const minX = Math.max(edge, platform.left);
    const maxX = Math.max(
        minX,
        Math.min(window.innerWidth - pet.offsetWidth - edge, platform.right - pet.offsetWidth)
    );

    if (now >= state.nextActionAt) {
        if (Math.random() < 0.48 && startJump(now)) {
            return;
        }

        if (platform.type === 'floor' && Math.random() < 0.35) {
            startWallClimb(now);
            return;
        }

        state.targetX = minX + Math.random() * (maxX - minX);
        state.nextActionAt = now + 2000 + Math.random() * 2500;
    }

    const distance = state.targetX - state.x;
    const desiredSpeed = Math.sign(distance) * Math.min(
        walkingSpeed,
        Math.sqrt(2 * walkingAcceleration * Math.abs(distance))
    );
    const speedChange = walkingAcceleration * elapsed;
    state.velocityX += Math.max(
        -speedChange,
        Math.min(speedChange, desiredSpeed - state.velocityX)
    );
    const nextX = state.x + state.velocityX * elapsed;

    if (Math.sign(distance) !== Math.sign(state.targetX - nextX) ||
        Math.abs(state.targetX - nextX) < 1) {
        state.x = state.targetX;
        state.velocityX = 0;
    } else {
        state.x = Math.max(minX, Math.min(maxX, nextX));
    }
    state.y = platform.top - pet.offsetHeight;
}

function animatePet(now) {
    const elapsed = Math.min((now - state.lastFrameAt) / 1000, 0.05);
    state.lastFrameAt = now;

    if (state.pointerDown) {
        renderPet();
        window.requestAnimationFrame(animatePet);
        return;
    }

    if (state.grounded) {
        walkOnPlatform(elapsed, now);
    }

    if (!state.grounded) {
        const previousBottom = state.y + pet.offsetHeight;
        state.velocityY += gravity * elapsed;
        state.x += state.velocityX * elapsed;
        state.y += state.velocityY * elapsed;
        state.x = Math.max(
            edge,
            Math.min(window.innerWidth - pet.offsetWidth - edge, state.x)
        );

        if (state.velocityY >= 0) {
            const platforms = [...pagePlatforms(), floorPlatform()];
            const landingPlatform = platforms.find(platform =>
                previousBottom <= platform.top &&
                state.y + pet.offsetHeight >= platform.top &&
                state.x + pet.offsetWidth > platform.left &&
                state.x < platform.right
            );
            if (landingPlatform) {
                landOn(landingPlatform, now);
            }
        }
    }

    renderPet();
    window.requestAnimationFrame(animatePet);
}

pet.addEventListener('pointerdown', event => {
    if (event.button !== 0) {
        return;
    }

    event.preventDefault();
    pet.setPointerCapture(event.pointerId);
    state.pointerDown = true;
    state.dragging = false;
    state.pointerStartX = event.clientX;
    state.pointerStartY = event.clientY;
    state.pointerOffsetX = event.clientX - state.x;
    state.pointerOffsetY = event.clientY - state.y;
    state.lastPointerX = event.clientX;
    state.lastPointerY = event.clientY;
    state.lastPointerAt = performance.now();
});

pet.addEventListener('pointermove', event => {
    if (!state.pointerDown) {
        return;
    }

    event.preventDefault();
    if (!state.dragging) {
        const deltaX = event.clientX - state.pointerStartX;
        const deltaY = event.clientY - state.pointerStartY;
        if (Math.hypot(deltaX, deltaY) < 6) {
            return;
        }

        state.dragging = true;
        state.targetY = state.y;
        state.grounded = false;
        state.platform = null;
        state.velocityX = 0;
        state.velocityY = 0;
        pet.classList.add('plant-pet-dragging');
        startAnimationFrame();
    }

    const now = performance.now();
    const elapsed = Math.max((now - state.lastPointerAt) / 1000, 0.001);
    const nextX = event.clientX - state.pointerOffsetX;
    const nextY = event.clientY - state.pointerOffsetY;
    state.velocityX = (event.clientX - state.lastPointerX) / elapsed;
    state.velocityY = (event.clientY - state.lastPointerY) / elapsed;
    state.x = Math.max(edge, Math.min(window.innerWidth - pet.offsetWidth - edge, nextX));
    state.y = Math.max(0, Math.min(window.innerHeight - pet.offsetHeight, nextY));
    state.lastPointerX = event.clientX;
    state.lastPointerY = event.clientY;
    state.lastPointerAt = now;
    renderPet();
});

function showPetHearts() {
    const hearts = pet.querySelector('.plant-pet-hearts');
    hearts.replaceChildren();
    for (let index = 0; index < 3; index += 1) {
        const heart = document.createElement('span');
        heart.textContent = '♥';
        heart.style.setProperty('--heart-index', String(index));
        hearts.append(heart);
    }
    pet.classList.remove('plant-pet-loved');
    void pet.offsetWidth;
    pet.classList.add('plant-pet-loved');
    window.setTimeout(() => {
        pet.classList.remove('plant-pet-loved');
        hearts.replaceChildren();
    }, 1100);
}

function startPetDrinking() {
    const progress = pet.querySelector('.plant-pet-drink-progress');
    const fill = progress.querySelector('.plant-pet-drink-progress-fill');
    bottlesFed += 1;
    const bottlesInCycle = bottlesFed % bottlesPerProgressCycle;
    const progressRatio = bottlesInCycle === 0
        ? 1
        : bottlesInCycle / bottlesPerProgressCycle;

    fill.style.transition = reduceMotion.matches
        ? 'none'
        : 'transform 250ms ease-out';
    fill.style.transform = `scaleX(${progressRatio})`;
    pet.classList.toggle('plant-pet-golden', bottlesInCycle === 0);
}

function bottleOverlapsPet(bottle) {
    const bottleBounds = bottle.getBoundingClientRect();
    const petBounds = pet.getBoundingClientRect();
    return bottleBounds.left < petBounds.right &&
        bottleBounds.right > petBounds.left &&
        bottleBounds.top < petBounds.bottom &&
        bottleBounds.bottom > petBounds.top;
}

function createWaterBottles() {
    const bottleGravity = 1500;
    let bottleNumber = 0;
    let activeBottle = null;

    function bottlePlatforms(bottle) {
        const platforms = Array.from(document.querySelectorAll(
            '.table-container table, .summary-container .card'
        ))
            .map(element => {
                const bounds = element.getBoundingClientRect();
                return {
                    element,
                    left: Math.max(0, bounds.left),
                    right: Math.min(window.innerWidth, bounds.right),
                    top: bounds.top
                };
            })
            .filter(platform =>
                platform.right - platform.left >= bottle.offsetWidth * 0.7 &&
                platform.top >= 0 &&
                platform.top < window.innerHeight - bottle.offsetHeight
            );

        platforms.push({
            element: null,
            left: 0,
            right: window.innerWidth,
            top: window.innerHeight
        });
        return platforms.sort((first, second) => first.top - second.top);
    }

    const spawnBottle = () => {
        if (activeBottle?.isConnected) {
            return;
        }

        bottleNumber += 1;
        const bottle = document.createElement('button');
        bottle.type = 'button';
        bottle.className = 'plant-water-bottle';
        bottle.setAttribute('aria-label', `Water bottle ${bottleNumber}; right-click and drag it to the plant`);
        bottle.title = 'Right-click and drag to the plant';
        bottle.innerHTML = '<img src="water-bottle.svg" alt="">';
        document.body.append(bottle);

        let pointerId = null;
        let pointerOffsetX = 0;
        let pointerOffsetY = 0;
        let lastPointerX = 0;
        let velocityY = 0;
        let groundedPlatform = null;
        let lastFrameAt = performance.now();

        const maxX = Math.max(0, window.innerWidth - bottle.offsetWidth);
        bottle.style.left = `${Math.min(maxX, window.innerWidth * 0.52)}px`;
        bottle.style.top = `${Math.max(0, window.innerHeight * 0.08)}px`;
        activeBottle = bottle;

        const animateBottle = now => {
            if (!bottle.isConnected) {
                return;
            }
            const elapsed = Math.min((now - lastFrameAt) / 1000, 0.05);
            lastFrameAt = now;

            if (pointerId === null) {
                const x = Number.parseFloat(bottle.style.left) || 0;
                const currentY = Number.parseFloat(bottle.style.top) || 0;
                if (groundedPlatform) {
                    const platform = groundedPlatform.element
                        ? groundedPlatform.element.getBoundingClientRect()
                        : { top: window.innerHeight, left: 0, right: window.innerWidth };
                    const stillAbovePlatform = x + bottle.offsetWidth > platform.left &&
                        x < platform.right &&
                        (!groundedPlatform.element || platform.top < window.innerHeight);
                    if (stillAbovePlatform) {
                        bottle.style.top = `${platform.top - bottle.offsetHeight}px`;
                    } else {
                        groundedPlatform = null;
                    }
                }

                if (!groundedPlatform) {
                    const previousBottom = currentY + bottle.offsetHeight;
                    velocityY += bottleGravity * elapsed;
                    const nextY = currentY + velocityY * elapsed;
                    const landing = bottlePlatforms(bottle).find(platform =>
                        previousBottom <= platform.top &&
                        nextY + bottle.offsetHeight >= platform.top &&
                        x + bottle.offsetWidth > platform.left &&
                        x < platform.right
                    );
                    if (landing) {
                        bottle.style.top = `${landing.top - bottle.offsetHeight}px`;
                        velocityY = 0;
                        groundedPlatform = landing;
                    } else {
                        bottle.style.top = `${Math.min(
                            window.innerHeight - bottle.offsetHeight,
                            nextY
                        )}px`;
                    }
                }
            }

            window.requestAnimationFrame(animateBottle);
        };
        window.requestAnimationFrame(animateBottle);

        bottle.addEventListener('contextmenu', event => event.preventDefault());
        bottle.addEventListener('pointerdown', event => {
            if (event.button !== 2) {
                return;
            }

            event.preventDefault();
            pointerId = event.pointerId;
            pointerOffsetX = event.clientX - bottle.offsetLeft;
            pointerOffsetY = event.clientY - bottle.offsetTop;
            lastPointerX = event.clientX;
            velocityY = 0;
            groundedPlatform = null;
            bottle.setPointerCapture(pointerId);
            bottle.classList.add('plant-water-bottle-held');
            bottle.querySelector('img').style.setProperty('--bottle-tilt', '-10deg');
            pet.classList.toggle('plant-pet-water-target', bottleOverlapsPet(bottle));
        });
        bottle.addEventListener('pointermove', event => {
            if (event.pointerId !== pointerId) {
                return;
            }

            event.preventDefault();
            const maxX = Math.max(0, window.innerWidth - bottle.offsetWidth);
            const maxY = Math.max(0, window.innerHeight - bottle.offsetHeight);
            bottle.style.left = `${Math.min(maxX, Math.max(0, event.clientX - pointerOffsetX))}px`;
            bottle.style.top = `${Math.min(maxY, Math.max(0, event.clientY - pointerOffsetY))}px`;
            groundedPlatform = null;
            const movementX = event.clientX - lastPointerX;
            const tilt = Math.max(-18, Math.min(18, -movementX * 0.8));
            bottle.querySelector('img').style.setProperty('--bottle-tilt', `${tilt}deg`);
            lastPointerX = event.clientX;
            pet.classList.toggle('plant-pet-water-target', bottleOverlapsPet(bottle));
        });

        const releaseBottle = event => {
            if (event.pointerId !== pointerId) {
                return;
            }

            const fedPet = bottleOverlapsPet(bottle);
            pointerId = null;
            bottle.classList.remove('plant-water-bottle-held');
            pet.classList.remove('plant-pet-water-target');
            if (bottle.hasPointerCapture(event.pointerId)) {
                bottle.releasePointerCapture(event.pointerId);
            }
            if (fedPet) {
                bottle.remove();
                activeBottle = null;
                showPetHearts();
                startPetDrinking();
                window.setTimeout(spawnBottle, 30000);
            } else {
                velocityY = 0;
                lastFrameAt = performance.now();
                bottle.querySelector('img').style.setProperty('--bottle-tilt', '0deg');
            }
        };

        bottle.addEventListener('pointerup', releaseBottle);
        bottle.addEventListener('pointercancel', event => {
            if (event.pointerId !== pointerId) {
                return;
            }
            pointerId = null;
            bottle.classList.remove('plant-water-bottle-held');
            pet.classList.remove('plant-pet-water-target');
            velocityY = 0;
            lastFrameAt = performance.now();
            bottle.querySelector('img').style.setProperty('--bottle-tilt', '0deg');
            if (bottle.hasPointerCapture(event.pointerId)) {
                bottle.releasePointerCapture(event.pointerId);
            }
        });
        window.addEventListener('resize', () => {
            if (pointerId === null) {
                const currentX = Number.parseFloat(bottle.style.left) || 0;
                bottle.style.left = `${Math.min(
                    Math.max(0, window.innerWidth - bottle.offsetWidth),
                    currentX
                )}px`;
                if (groundedPlatform?.element === null) {
                    bottle.style.top = `${window.innerHeight - bottle.offsetHeight}px`;
                }
            }
        });
    };

    window.setTimeout(spawnBottle, 30000);
}

function releasePet(event) {
    if (!state.pointerDown) {
        return;
    }

    const wasDragged = state.dragging;
    state.pointerDown = false;
    state.dragging = false;
    if (wasDragged) {
        state.velocityX = Math.max(-260, Math.min(260, state.velocityX));
        state.velocityY = Math.max(-500, Math.min(500, state.velocityY));
        state.lastFrameAt = performance.now();
        pet.classList.remove('plant-pet-dragging');
        startAnimationFrame();
    } else {
        showPetHearts();
    }

    if (pet.hasPointerCapture(event.pointerId)) {
        pet.releasePointerCapture(event.pointerId);
    }
}

pet.addEventListener('pointerup', releasePet);
pet.addEventListener('pointercancel', event => {
    if (state.dragging) {
        releasePet(event);
    } else {
        state.pointerDown = false;
        if (pet.hasPointerCapture(event.pointerId)) {
            pet.releasePointerCapture(event.pointerId);
        }
    }
});
pet.addEventListener('lostpointercapture', () => {
    if (state.dragging) {
        state.dragging = false;
        state.lastFrameAt = performance.now();
        pet.classList.remove('plant-pet-dragging');
        startAnimationFrame();
    }
});

function applyMotionPreference() {
    if (reduceMotion.matches) {
        state.x = edge;
        state.y = floorPlatform().top - pet.offsetHeight;
        state.velocityX = 0;
        state.velocityY = 0;
        state.grounded = true;
        state.platform = floorPlatform();
        state.nextActionAt = Number.POSITIVE_INFINITY;
        renderPet();
        return;
    }

    state.y = -pet.offsetHeight;
    state.velocityY = 0;
    state.grounded = false;
    state.platform = null;
    state.lastFrameAt = performance.now();
    startAnimationFrame();
}

reduceMotion.addEventListener('change', applyMotionPreference);
window.addEventListener('resize', () => {
    const maxX = Math.max(edge, window.innerWidth - pet.offsetWidth - edge);
    state.x = Math.min(state.x, maxX);
    if (state.grounded && state.platform?.type === 'wall') {
        state.x = wallPositionX(state.platform.side);
    } else if (state.grounded && state.platform?.type === 'floor') {
        state.platform = floorPlatform();
        state.y = state.platform.top - pet.offsetHeight;
    }
    renderPet();
});

window.addEventListener('scroll', () => {
    if (!state.grounded || !state.platform?.element) {
        return;
    }

    const bounds = state.platform.element.getBoundingClientRect();
    if (Math.abs(bounds.top - (state.y + pet.offsetHeight)) > 3) {
        state.grounded = false;
        state.platform = null;
        state.velocityX = 0;
    } else {
        state.platform.top = bounds.top;
        state.platform.left = Math.max(0, bounds.left);
        state.platform.right = Math.min(window.innerWidth, bounds.right);
    }
});

applyMotionPreference();
createWaterBottles();
