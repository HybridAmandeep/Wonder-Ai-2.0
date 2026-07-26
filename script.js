/**
 * WanderAI – Unified Client-Side Application Script
 * Orchestrates: Authentication UI states, search auto-complete, interactive notifications,
 *              dynamic explore cards, detail view modal, weather updates, booking microinteraction,
 *              checkout validation, dashboard lists, and local storage state sync.
 */
document.addEventListener('DOMContentLoaded', () => {

    // Global Lucide Icon Refresh Helper
    const refreshIcons = () => {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    };

    // Initialize Flatpickr for date inputs (Home page "When" field)
    if (typeof flatpickr !== 'undefined') {
        const whenInput = document.getElementById('whenInput');
        if (whenInput) {
            flatpickr(whenInput, {
                dateFormat: "d/m/Y",
                allowInput: true
            });
        }
    }

    // =========================================
    // 1. AUTHENTICATION STATE SYNC (ALL PAGES)
    // =========================================
    const navUserArea = document.getElementById('navUserArea');

    const checkAuthState = () => {
        if (!navUserArea) return;
        const user = window.WanderData ? window.WanderData.getCurrentUser() : null;

        if (user) {
            // User logged in – show avatar, name, and profile dropdown
            const firstLetter = user.name ? user.name.charAt(0).toUpperCase() : 'U';
            navUserArea.innerHTML = `
                <div class="dropdown" id="userProfileDropdown">
                    <div class="user-profile-nav" id="userProfileToggle">
                        <div class="user-avatar">${firstLetter}</div>
                        <span class="user-name-label">${user.name}</span>
                        <i data-lucide="chevron-down" style="width: 14px; height: 14px; margin-left: 2px;"></i>
                    </div>
                    <div class="dropdown-menu" id="userProfileMenu" style="right: 0;">
                        <a href="dashboard.html" class="dropdown-item">
                            <i data-lucide="layout-dashboard" class="dropdown-item-icon"></i>
                            <div>
                                <span class="dropdown-item-title">My Dashboard</span>
                                <span class="dropdown-item-desc">Trips, plans & settings</span>
                            </div>
                        </a>
                        <a href="wishlist.html" class="dropdown-item">
                            <i data-lucide="heart" class="dropdown-item-icon"></i>
                            <div>
                                <span class="dropdown-item-title">My Wishlist</span>
                                <span class="dropdown-item-desc">Saved dream trips</span>
                            </div>
                        </a>
                        <div style="border-top: 1px solid var(--gray-100); margin: 6px 0;"></div>
                        <a href="#" class="dropdown-item" id="logoutNavLink" style="color: var(--accent);">
                            <i data-lucide="log-out" class="dropdown-item-icon"></i>
                            <div>
                                <span class="dropdown-item-title">Log Out</span>
                                <span class="dropdown-item-desc">End your session</span>
                            </div>
                        </a>
                    </div>
                </div>
            `;

            // Toggle Profile Dropdown
            const userProfileToggle = document.getElementById('userProfileToggle');
            const userProfileDropdown = document.getElementById('userProfileDropdown');
            if (userProfileToggle && userProfileDropdown) {
                userProfileToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    userProfileDropdown.classList.toggle('active');
                });
            }

            // Handle Logout Click
            const logoutNavLink = document.getElementById('logoutNavLink');
            if (logoutNavLink) {
                logoutNavLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (window.WanderData) {
                        window.WanderData.logout();
                        window.location.href = "index.html";
                    }
                });
            }
        } else {
            // User logged out – show standard Sign Up
            navUserArea.innerHTML = `
                <a href="signup.html" class="btn-primary" id="signUpBtn">
                    Sign Up <i data-lucide="arrow-right" class="btn-icon"></i>
                </a>
            `;
        }
        refreshIcons();
    };

    checkAuthState();

    // =========================================
    // 2. INTERACTIVE NOTIFICATION PANEL
    // =========================================
    const navNotifBtn = document.getElementById('navNotifBtn');
    const navNotifMenu = document.getElementById('navNotifMenu');
    const navNotifBadge = document.getElementById('navNotifBadge');
    const notifList = document.getElementById('notifList');
    const notifClearBtn = document.getElementById('notifClearBtn');

    const renderNotifications = () => {
        if (!notifList || !window.WanderData) return;
        const notifs = window.WanderData.getNotifications();
        const unreadCount = notifs.filter(n => n.unread).length;

        // Update badge
        if (unreadCount > 0 && navNotifBadge) {
            navNotifBadge.textContent = unreadCount;
            navNotifBadge.style.display = 'flex';
        } else if (navNotifBadge) {
            navNotifBadge.style.display = 'none';
        }

        // Render List
        if (notifs.length === 0) {
            notifList.innerHTML = `
                <div class="notif-empty">
                    <i data-lucide="bell-off"></i>
                    No notifications yet
                </div>
            `;
        } else {
            notifList.innerHTML = notifs.map(n => {
                const date = new Date(n.timestamp);
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • ' + date.toLocaleDateString();
                return `
                    <div class="notif-item ${n.unread ? 'unread' : ''}" data-id="${n.id}">
                        <div class="notif-item-title">${n.title}</div>
                        <div class="notif-item-desc">${n.message}</div>
                        <span class="notif-item-time">${timeStr}</span>
                    </div>
                `;
            }).join('');
        }
        refreshIcons();
    };

    // Toggle Notifications Menu
    if (navNotifBtn && navNotifMenu) {
        navNotifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navNotifMenu.classList.toggle('active');
            if (navNotifMenu.classList.contains('active') && window.WanderData) {
                window.WanderData.markNotificationsAsRead();
                renderNotifications();
            }
        });
    }

    // Clear notifications
    if (notifClearBtn && window.WanderData) {
        notifClearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.WanderData.clearNotifications();
        });
    }

    // Subscribe to notification updates
    window.addEventListener('wanderNotifUpdate', renderNotifications);
    renderNotifications();

    // =========================================
    // 3. EXPANDABLE SEARCH & REAL AUTOCOMPLETE
    // =========================================
    const searchContainer = document.getElementById('searchContainer');
    const searchToggle = document.getElementById('searchToggle');
    const searchInput = document.getElementById('searchInput');
    const searchClose = document.getElementById('searchClose');
    const searchResultsOverlay = document.getElementById('searchResultsOverlay');

    if (searchToggle && searchContainer && searchInput && searchClose && searchResultsOverlay) {
        const openSearch = () => {
            searchContainer.classList.add('active');
            document.body.style.overflow = 'hidden';
            setTimeout(() => searchInput.focus(), 300);
        };

        const closeSearch = () => {
            searchContainer.classList.remove('active');
            searchResultsOverlay.classList.remove('active');
            document.body.style.overflow = '';
            searchInput.value = '';
        };

        searchToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            openSearch();
        });

        searchClose.addEventListener('click', closeSearch);

        // Search Input Event
        searchInput.addEventListener('input', () => {
            const query = searchInput.value;
            if (!query || query.trim() === '') {
                searchResultsOverlay.classList.remove('active');
                return;
            }

            if (window.WanderData) {
                const results = window.WanderData.search(query).slice(0, 5); // top 5 results
                if (results.length === 0) {
                    searchResultsOverlay.innerHTML = `
                        <div style="padding: 16px 24px; color: var(--gray-400); font-size: 0.9rem;">
                            No matching destinations found for "${query}"
                        </div>
                    `;
                } else {
                    searchResultsOverlay.innerHTML = results.map(r => `
                        <div class="search-result-item" data-dest-id="${r.id}">
                            <img src="${r.image}" class="search-result-img" alt="${r.name}">
                            <div class="search-result-info">
                                <h5>${r.name}, ${r.country}</h5>
                                <p>${r.price} • ${r.duration} Days</p>
                            </div>
                        </div>
                    `).join('');

                    // Result Click Routing
                    document.querySelectorAll('.search-result-item').forEach(item => {
                        item.addEventListener('click', () => {
                            const destId = item.getAttribute('data-dest-id');
                            closeSearch();
                            window.location.href = `booking.html?id=${destId}`;
                        });
                    });
                }
                searchResultsOverlay.classList.add('active');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeSearch();
        });
    }

    // =========================================
    // 4. DROPDOWN & MOBILE SIDEBAR MENU
    // =========================================
    const moreDropdown = document.getElementById('moreDropdown');
    const dropdownToggle = document.getElementById('dropdownToggle');
    const hamburger = document.getElementById('hamburger');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const mobileSlideMenu = document.getElementById('mobileSlideMenu');
    const mobileClose = document.getElementById('mobileClose');

    if (dropdownToggle && moreDropdown) {
        dropdownToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            moreDropdown.classList.toggle('active');
        });
    }

    if (hamburger && mobileOverlay && mobileSlideMenu && mobileClose) {
        const openMobileMenu = () => {
            hamburger.classList.add('active');
            mobileOverlay.classList.add('active');
            mobileSlideMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        const closeMobileMenu = () => {
            hamburger.classList.remove('active');
            mobileOverlay.classList.remove('active');
            mobileSlideMenu.classList.remove('active');
            document.body.style.overflow = '';
        };

        hamburger.addEventListener('click', openMobileMenu);
        mobileClose.addEventListener('click', closeMobileMenu);
        mobileOverlay.addEventListener('click', closeMobileMenu);
    }

    // General outside clicks to close dropdowns
    document.addEventListener('click', () => {
        if (moreDropdown) moreDropdown.classList.remove('active');
        if (navNotifMenu) navNotifMenu.classList.remove('active');
        const userProfileDropdown = document.getElementById('userProfileDropdown');
        if (userProfileDropdown) userProfileDropdown.classList.remove('active');
    });

    // =========================================
    // 5. EXPLORE PAGE DYNAMIC CARDS & FILTERS
    // =========================================
    const dynamicDestGrid = document.getElementById('dynamicDestGrid');
    const filterSearch = document.getElementById('filterSearch');
    const filterCategory = document.getElementById('filterCategory');
    const filterPrice = document.getElementById('filterPrice');
    const filterDuration = document.getElementById('filterDuration');
    const priceRangeVal = document.getElementById('priceRangeVal');
    const durationRangeVal = document.getElementById('durationRangeVal');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');

    // Render Cards in Grid
    const renderDestinations = () => {
        if (!dynamicDestGrid || !window.WanderData) return;

        const query = filterSearch ? filterSearch.value : '';
        const options = {
            category: filterCategory ? filterCategory.value : 'all',
            maxPrice: filterPrice ? parseInt(filterPrice.value) : 2500,
            maxDuration: filterDuration ? parseInt(filterDuration.value) : 8
        };

        const results = window.WanderData.search(query, options);

        if (results.length === 0) {
            dynamicDestGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 64px 24px; color: var(--gray-500);">
                    <i data-lucide="search-code" style="width: 48px; height: 48px; display: block; margin: 0 auto 16px; color: var(--gray-300);"></i>
                    <h3>No Destinations Match Your Criteria</h3>
                    <p style="margin-top: 8px;">Try modifying your budget, duration, or search terms.</p>
                </div>
            `;
            refreshIcons();
            return;
        }

        dynamicDestGrid.innerHTML = results.map(d => {
            const isFav = window.WanderData.isWishlisted(d.id);
            const badgeHtml = d.id === 'santorini' ? `<div class="card-badge">Trending</div>` : 
                              d.id === 'maldives' ? `<div class="card-badge badge-hot">Hot Deal</div>` : '';

            // Handle Santorini specific booking microinteraction layout
            const bookButtonHtml = d.id === 'santorini' ? `
                <button class="btn-book" id="demoBookBtn" data-id="${d.id}">
                    <span class="btn-book-text">Book Trip</span>
                    <div class="btn-book-spinner hidden" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="50 14" /></svg>
                    </div>
                    <div class="btn-book-progress-track" aria-hidden="true"><div class="btn-book-progress-fill"></div></div>
                    <div class="btn-book-check hidden" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none"><path class="check-path" d="M4 12.6L9.3 18L20 6" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </div>
                    <div class="btn-book-particles" aria-hidden="true"></div>
                </button>
            ` : `
                <button class="btn-primary select-card-btn" data-id="${d.id}" style="padding: 8px 16px; font-size: 0.85rem;">
                    Details
                </button>
            `;

            return `
                <div class="destination-card ${d.id === 'santorini' ? 'card-large' : ''}" data-id="${d.id}">
                    <img src="${d.image}" alt="${d.name}" class="card-image">
                    <div class="card-overlay"></div>
                    ${badgeHtml}
                    <button class="card-wishlist ${isFav ? 'wishlisted' : ''}" data-id="${d.id}" aria-label="Add to wishlist">
                        <i data-lucide="heart" style="${isFav ? 'fill: var(--accent); stroke: var(--accent);' : ''}"></i>
                    </button>
                    <div class="card-content">
                        <div class="card-rating">
                            <i data-lucide="star" class="star-icon"></i>
                            <span>${d.rating}</span>
                            <span class="card-reviews">(${d.reviewsCount} reviews)</span>
                        </div>
                        <h3 class="card-title">${d.name}, ${d.country}</h3>
                        <p class="card-desc">${d.description.substring(0, 60)}...</p>
                        <div class="card-footer">
                            <div class="card-footer-info">
                                <span class="card-price">From <strong>$${d.price}</strong></span>
                                <span class="card-duration"><i data-lucide="clock"></i> ${d.duration} days</span>
                            </div>
                            ${bookButtonHtml}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        refreshIcons();
        attachCardEventHandlers();
    };

    // Filter Change Listeners
    if (filterSearch) filterSearch.addEventListener('input', renderDestinations);
    if (filterCategory) filterCategory.addEventListener('change', renderDestinations);
    
    if (filterPrice && priceRangeVal) {
        filterPrice.addEventListener('input', () => {
            priceRangeVal.textContent = `$${parseInt(filterPrice.value).toLocaleString()}`;
            renderDestinations();
        });
    }
    if (filterDuration && durationRangeVal) {
        filterDuration.addEventListener('input', () => {
            durationRangeVal.textContent = `${filterDuration.value} days`;
            renderDestinations();
        });
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            if (filterSearch) filterSearch.value = '';
            if (filterCategory) filterCategory.value = 'all';
            if (filterPrice) {
                filterPrice.value = 2500;
                priceRangeVal.textContent = '$2,500';
            }
            if (filterDuration) {
                filterDuration.value = 8;
                durationRangeVal.textContent = '8 days';
            }
            renderDestinations();
        });
    }

    // =========================================
    // 6. DETAIL VIEW MODAL & BOOKING DATES CALC
    // =========================================
    const detailModalOverlay = document.getElementById('detailModalOverlay');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalBookingForm = document.getElementById('modalBookingForm');

    // Form inputs inside modal
    const bookingStartInput = document.getElementById('bookingStart');
    const bookingEndInput = document.getElementById('bookingEnd');
    const bookingGuestsInput = document.getElementById('bookingGuests');
    const bookingTotalDisplay = document.getElementById('bookingTotal');

    let activeModalDest = null;

    const openDestinationModal = async (destId) => {
        if (!detailModalOverlay || !window.WanderData) return;
        const dest = window.WanderData.getDestinationById(destId);
        if (!dest) return;

        activeModalDest = dest;

        // Populate elements
        document.getElementById('modalHeroImg').src = dest.image;
        document.getElementById('modalHeroImg').alt = dest.name;
        document.getElementById('modalTitle').textContent = `${dest.name}, ${dest.country}`;
        document.getElementById('modalPrice').textContent = `$${dest.price}`;
        document.getElementById('modalDuration').innerHTML = `<i data-lucide="clock" class="icon-inline"></i> ${dest.duration} days`;
        document.getElementById('modalRating').innerHTML = `<i data-lucide="star" class="icon-inline" style="color: #FBBF24; fill: #FBBF24;"></i> ${dest.rating}`;
        document.getElementById('modalSeason').textContent = `Best Season: ${dest.bestSeason}`;
        document.getElementById('modalDesc').textContent = dest.description;

        // Render activities
        const activityList = document.getElementById('modalActivityList');
        if (activityList) {
            activityList.innerHTML = dest.activities.map(a => `
                <li class="activity-item"><i data-lucide="check-circle" style="width:16px; height:16px; flex-shrink:0;"></i> ${a}</li>
            `).join('');
        }

        // Initialize Dates input
        const today = new Date().toISOString().split('T')[0];
        if (bookingStartInput) {
            bookingStartInput.min = today;
            bookingStartInput.value = today;
        }
        if (bookingEndInput) {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + dest.duration);
            bookingEndInput.min = today;
            bookingEndInput.value = nextWeek.toISOString().split('T')[0];
        }
        if (bookingGuestsInput) {
            bookingGuestsInput.value = 1;
        }

        // Compute Price
        updateModalBookingPrice();

        // Show modal overlay
        detailModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        refreshIcons();

        // Get Weather Forecast
        updateWeatherInfo(dest);
    };

    const updateWeatherInfo = async (dest) => {
        const tempEl = document.getElementById('weatherTemp');
        const descEl = document.getElementById('weatherDesc');
        const sourceEl = document.getElementById('weatherSource');
        const iconEl = document.getElementById('weatherIcon');
        const feelsEl = document.getElementById('weatherFeels');
        const humidityEl = document.getElementById('weatherHumidity');
        const windEl = document.getElementById('weatherWind');

        if (!tempEl || !window.WanderData) return;

        // Reset to loading state
        tempEl.textContent = '--°C';
        descEl.textContent = 'Fetching weather forecast...';
        iconEl.src = '';
        iconEl.style.display = 'none';

        const weather = await window.WanderData.getWeather(dest.name, dest.coordinates.lat, dest.coordinates.lon);
        
        tempEl.textContent = `${weather.temp}°C`;
        descEl.textContent = weather.description;
        sourceEl.textContent = weather.source === 'live' ? 'live weather feed' : 'simulated forecast';
        
        if (weather.icon) {
            iconEl.src = weather.icon;
            iconEl.style.display = 'block';
        }
        
        if (feelsEl) feelsEl.textContent = `${weather.feelsLike}°C`;
        if (humidityEl) humidityEl.textContent = `${weather.humidity}%`;
        if (windEl) windEl.textContent = `${weather.windSpeed} km/h`;
    };

    const updateModalBookingPrice = () => {
        if (!activeModalDest || !bookingTotalDisplay) return;
        const base = activeModalDest.price;
        const guests = bookingGuestsInput ? parseInt(bookingGuestsInput.value) || 1 : 1;
        
        let multiplier = 1;
        if (bookingStartInput && bookingEndInput && bookingStartInput.value && bookingEndInput.value) {
            const start = new Date(bookingStartInput.value);
            const end = new Date(bookingEndInput.value);
            const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            if (diffDays > 0) {
                multiplier = diffDays / activeModalDest.duration;
            }
        }
        
        const total = Math.round(base * guests * multiplier);
        bookingTotalDisplay.textContent = `$${total.toLocaleString()}`;
    };

    // Modal Input Listeners
    if (bookingStartInput) bookingStartInput.addEventListener('change', updateModalBookingPrice);
    if (bookingEndInput) bookingEndInput.addEventListener('change', updateModalBookingPrice);
    if (bookingGuestsInput) bookingGuestsInput.addEventListener('input', updateModalBookingPrice);

    // Modal close
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => {
            detailModalOverlay.classList.remove('active');
            document.body.style.overflow = '';
            activeModalDest = null;
        });
    }
    if (detailModalOverlay) {
        detailModalOverlay.addEventListener('click', (e) => {
            if (e.target === detailModalOverlay) {
                detailModalOverlay.classList.remove('active');
                document.body.style.overflow = '';
                activeModalDest = null;
            }
        });
    }

    // Modal Booking Form Submit -> Route to Checkout
    if (modalBookingForm) {
        modalBookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!activeModalDest) return;

            const start = bookingStartInput.value;
            const end = bookingEndInput.value;
            const guests = bookingGuestsInput.value;

            // Route to checkout
            window.location.href = `checkout.html?dest=${activeModalDest.id}&start=${start}&end=${end}&guests=${guests}`;
        });
    }

    // =========================================
    // 7. CARD INTERACTION HANDLERS
    // =========================================
    const attachCardEventHandlers = () => {
        // Details buttons click
        document.querySelectorAll('.select-card-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const destId = btn.getAttribute('data-id');
                openDestinationModal(destId);
            });
        });

        // Wishlist button click
        document.querySelectorAll('.card-wishlist').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const destId = btn.getAttribute('data-id');
                if (!window.WanderData) return;

                const isFav = window.WanderData.toggleWishlist(destId);
                btn.classList.toggle('wishlisted', isFav);

                const icon = btn.querySelector('svg');
                if (icon) {
                    if (isFav) {
                        icon.style.fill = 'var(--accent)';
                        icon.style.stroke = 'var(--accent)';
                    } else {
                        icon.style.fill = 'none';
                        icon.style.stroke = 'currentColor';
                    }
                }
                
                // Scale animation
                btn.animate([
                    { transform: 'scale(1)' },
                    { transform: 'scale(1.2)' },
                    { transform: 'scale(1)' }
                ], { duration: 300, easing: 'ease-out' });
            });
        });

        // Santorini Booking button microinteraction logic
        const demoBookBtn = document.getElementById('demoBookBtn');
        if (demoBookBtn) {
            const btnText = demoBookBtn.querySelector('.btn-book-text');
            const btnSpinner = demoBookBtn.querySelector('.btn-book-spinner');
            const btnProgressFill = demoBookBtn.querySelector('.btn-book-progress-fill');
            const btnCheck = demoBookBtn.querySelector('.btn-book-check');
            const btnParticles = demoBookBtn.querySelector('.btn-book-particles');
            const bookingOverlay = document.getElementById('bookingOverlay');
            const bookingSuccessToast = document.getElementById('bookingSuccessToast');

            const createParticleBurst = () => {
                const colors = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#3B82F6', '#FBBF24'];
                for (let i = 0; i < 12; i++) {
                    const particle = document.createElement('div');
                    particle.classList.add('book-particle');
                    const angle = (i / 12) * 360;
                    const distance = 30 + Math.random() * 30;
                    const tx = Math.cos(angle * Math.PI / 180) * distance;
                    const ty = Math.sin(angle * Math.PI / 180) * distance;
                    particle.style.setProperty('--tx', `${tx}px`);
                    particle.style.setProperty('--ty', `${ty}px`);
                    particle.style.background = colors[i % colors.length];
                    btnParticles.appendChild(particle);
                    requestAnimationFrame(() => particle.classList.add('burst'));
                    setTimeout(() => particle.remove(), 800);
                }
            };

            const resetButton = () => {
                demoBookBtn.classList.remove('is-loading', 'is-progress', 'is-success');
                if (btnText) btnText.classList.remove('hidden');
                if (btnSpinner) btnSpinner.classList.add('hidden');
                if (btnCheck) btnCheck.classList.add('hidden');
                if (btnProgressFill) {
                    btnProgressFill.style.transition = 'none';
                    btnProgressFill.style.width = '0%';
                }
                if (bookingOverlay) bookingOverlay.classList.remove('active');
                if (bookingSuccessToast) bookingSuccessToast.classList.remove('active');
            };

            demoBookBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (demoBookBtn.classList.contains('is-loading') ||
                    demoBookBtn.classList.contains('is-progress') ||
                    demoBookBtn.classList.contains('is-success')) return;

                // Check auth first
                if (window.WanderData && !window.WanderData.getCurrentUser()) {
                    window.location.href = "signup.html";
                    return;
                }

                // Loading
                demoBookBtn.classList.add('is-loading');
                if (btnText) btnText.classList.add('hidden');
                if (btnSpinner) btnSpinner.classList.remove('hidden');

                setTimeout(() => {
                    // Progress
                    demoBookBtn.classList.remove('is-loading');
                    demoBookBtn.classList.add('is-progress');
                    if (btnSpinner) btnSpinner.classList.add('hidden');

                    requestAnimationFrame(() => {
                        if (btnProgressFill) {
                            btnProgressFill.style.transition = 'width 1.8s cubic-bezier(0.22, 0.68, 0.32, 1)';
                            btnProgressFill.style.width = '100%';
                        }
                    });

                    setTimeout(() => {
                        // Success
                        demoBookBtn.classList.remove('is-progress');
                        demoBookBtn.classList.add('is-success');
                        if (btnCheck) btnCheck.classList.remove('hidden');
                        createParticleBurst();

                        // Add booking to registry
                        const today = new Date();
                        const nextWeek = new Date();
                        nextWeek.setDate(today.getDate() + 5);
                        const startStr = today.toISOString().split('T')[0];
                        const endStr = nextWeek.toISOString().split('T')[0];

                        if (window.WanderData) {
                            window.WanderData.addBooking('santorini', startStr, endStr, 1, 1299, { card: 'demo' });
                        }

                        setTimeout(() => {
                            if (bookingOverlay) bookingOverlay.classList.add('active');
                            if (bookingSuccessToast) bookingSuccessToast.classList.add('active');
                        }, 300);

                        // Auto-redirect to dashboard after toast
                        setTimeout(() => {
                            window.location.href = "dashboard.html";
                        }, 3500);

                    }, 1900);
                }, 1200);
            });
        }
    };

    // Auto-load details if routing contains destination ID (e.g. ?id=kyoto)
    const checkUrlPreselection = () => {
        const params = new URLSearchParams(window.location.search);
        const destId = params.get('id');
        if (destId) {
            openDestinationModal(destId);
        }
    };

    // Initial Explore Page Load
    if (dynamicDestGrid) {
        renderDestinations();
        checkUrlPreselection();
    }

    // =========================================
    // 8. SECURE CHECKOUT PAGE FLOW
    // =========================================
    const checkoutPaymentForm = document.getElementById('checkoutPaymentForm');
    const billNameInput = document.getElementById('billName');
    const billEmailInput = document.getElementById('billEmail');
    const billPhoneInput = document.getElementById('billPhone');

    if (checkoutPaymentForm && window.WanderData) {
        // Enforce user logged in
        const user = window.WanderData.getCurrentUser();
        if (!user) {
            window.location.href = "signup.html";
            return;
        }

        // Fill user details
        if (billNameInput) billNameInput.value = user.name;
        if (billEmailInput) billEmailInput.value = user.email;

        // Parse query params
        const params = new URLSearchParams(window.location.search);
        const destId = params.get('dest') || 'santorini';
        const start = params.get('start') || new Date().toISOString().split('T')[0];
        const end = params.get('end') || new Date().toISOString().split('T')[0];
        const guests = parseInt(params.get('guests')) || 1;

        const dest = window.WanderData.getDestinationById(destId);
        if (dest) {
            // Summary binding
            document.getElementById('summaryImg').src = dest.image;
            document.getElementById('summaryTitle').textContent = dest.name;
            document.getElementById('summaryCountry').textContent = dest.country;
            document.getElementById('summaryDuration').textContent = `${dest.duration} days`;
            document.getElementById('summaryStart').textContent = start;
            document.getElementById('summaryEnd').textContent = end;
            document.getElementById('summaryGuests').textContent = guests;

            // Price calculation
            const diffDays = Math.max(1, Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)));
            const multiplier = diffDays / dest.duration;
            const basePrice = Math.round(dest.price * guests * multiplier);
            
            // AI Discount (based on user active subscription tier)
            let discount = 0;
            if (user.plan.includes("Nomad")) discount = Math.round(basePrice * 0.1); // 10% off
            if (user.plan.includes("Atlas")) discount = Math.round(basePrice * 0.15); // 15% off

            const taxes = Math.round(basePrice * 0.08); // 8% service tax
            const total = basePrice - discount + taxes;

            document.getElementById('summaryBasePrice').textContent = `$${basePrice.toLocaleString()}`;
            document.getElementById('summaryDiscount').textContent = `-$${discount.toLocaleString()}`;
            document.getElementById('summaryTaxes').textContent = `$${taxes.toLocaleString()}`;
            document.getElementById('summaryTotal').textContent = `$${total.toLocaleString()}`;

            // Form Submit with Razorpay
            checkoutPaymentForm.addEventListener('submit', (e) => {
                e.preventDefault();

                // Simple check
                if (!billNameInput.value) return;
                if (!billPhoneInput || !billPhoneInput.value) return;

                const payBtn = document.getElementById('payBtn');
                const btnText = payBtn.querySelector('.btn-text');
                const loader = payBtn.querySelector('.loader');

                payBtn.disabled = true;
                if (btnText) btnText.style.display = 'none';
                if (loader) loader.style.display = 'block';

                // Open Custom Demo Payment Modal
                const demoModal = document.getElementById('demoPaymentOverlay');
                const demoTotalText = document.getElementById('demoPayTotalText');
                if (demoModal && demoTotalText) {
                    demoTotalText.textContent = `$${total.toLocaleString()}`;
                    demoModal.classList.add('active');
                }
                
                payBtn.disabled = false;
                if (btnText) btnText.style.display = 'block';
                if (loader) loader.style.display = 'none';
            });

            // Demo Payment Modal Logic
            const demoModal = document.getElementById('demoPaymentOverlay');
            const demoClose = document.getElementById('demoPaymentClose');
            const demoTabs = document.querySelectorAll('.demo-payment-tab');
            const demoSections = document.querySelectorAll('.demo-payment-section');
            const demoConfirmBtn = document.getElementById('demoPayConfirmBtn');

            if (demoClose) {
                demoClose.addEventListener('click', () => {
                    demoModal.classList.remove('active');
                });
            }

            if (demoTabs) {
                demoTabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        demoTabs.forEach(t => t.classList.remove('active'));
                        demoSections.forEach(s => s.classList.remove('active'));
                        
                        tab.classList.add('active');
                        const targetId = `demoPay-${tab.dataset.payMethod}`;
                        const targetSection = document.getElementById(targetId);
                        if (targetSection) targetSection.classList.add('active');
                    });
                });
            }

            if (demoConfirmBtn) {
                demoConfirmBtn.addEventListener('click', () => {
                    const btnText = demoConfirmBtn.querySelector('.btn-text');
                    const loader = demoConfirmBtn.querySelector('.loader');
                    
                    demoConfirmBtn.disabled = true;
                    if (btnText) btnText.style.display = 'none';
                    if (loader) loader.style.display = 'block';

                    // Simulate Bank Processing Delay
                    setTimeout(() => {
                        // Close Modal
                        demoModal.classList.remove('active');

                        // Reset button state for next time
                        demoConfirmBtn.disabled = false;
                        if (btnText) btnText.style.display = 'block';
                        if (loader) loader.style.display = 'none';

                        // On Payment Success
                        const method = document.querySelector('.demo-payment-tab.active').dataset.payMethod.toUpperCase();
                        window.WanderData.addBooking(destId, start, end, guests, total, { 
                            payment_id: "DEMO_" + Math.random().toString(36).substring(2, 9).toUpperCase(),
                            method: method 
                        });

                        const bookingOverlay = document.getElementById('bookingOverlay');
                        const bookingSuccessToast = document.getElementById('bookingSuccessToast');

                        if (bookingOverlay) bookingOverlay.classList.add('active');
                        if (bookingSuccessToast) bookingSuccessToast.classList.add('active');

                        setTimeout(() => {
                            window.location.href = "dashboard.html";
                        }, 3500);
                    }, 2000);
                });
            }
        }
    }

    // =========================================
    // 9. WISHLIST PAGE DISPLAY
    // =========================================
    const wishlistGrid = document.getElementById('wishlistGrid');
    const wishlistEmptyState = document.getElementById('wishlistEmptyState');

    const renderWishlist = () => {
        if (!wishlistGrid || !window.WanderData) return;
        const favIds = window.WanderData.getWishlist();

        if (favIds.length === 0) {
            wishlistGrid.style.display = 'none';
            if (wishlistEmptyState) wishlistEmptyState.style.display = 'block';
            return;
        }

        wishlistGrid.style.display = 'grid';
        if (wishlistEmptyState) wishlistEmptyState.style.display = 'none';

        const favs = favIds.map(id => window.WanderData.getDestinationById(id)).filter(d => d !== null);

        wishlistGrid.innerHTML = favs.map(d => `
            <div class="destination-card" data-id="${d.id}">
                <img src="${d.image}" alt="${d.name}" class="card-image">
                <div class="card-overlay"></div>
                <button class="card-wishlist wishlisted" data-id="${d.id}" aria-label="Remove from wishlist">
                    <i data-lucide="heart" style="fill: var(--accent); stroke: var(--accent);"></i>
                </button>
                <div class="card-content">
                    <div class="card-rating">
                        <i data-lucide="star" class="star-icon"></i>
                        <span>${d.rating}</span>
                        <span class="card-reviews">(${d.reviewsCount} reviews)</span>
                    </div>
                    <h3 class="card-title">${d.name}, ${d.country}</h3>
                    <p class="card-desc">${d.description.substring(0, 80)}...</p>
                    <div class="card-footer">
                        <div class="card-footer-info">
                            <span class="card-price">From <strong>$${d.price}</strong></span>
                            <span class="card-duration"><i data-lucide="clock"></i> ${d.duration} days</span>
                        </div>
                        <button class="btn-primary select-card-btn" data-id="${d.id}">
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        refreshIcons();
        attachCardEventHandlers();
    };

    if (wishlistGrid) {
        renderWishlist();
        // Hook list updates
        window.addEventListener('click', (e) => {
            if (e.target.closest('.card-wishlist')) {
                setTimeout(renderWishlist, 100);
            }
        });
    }

    // =========================================
    // 10. USER DASHBOARD INTERACTION
    // =========================================
    const dashboardUpcomingTrips = document.getElementById('dashboardUpcomingTrips');
    const dashboardPastTrips = document.getElementById('dashboardPastTrips');
    const tabTripsBtn = document.getElementById('tabTripsBtn');
    const tabSettingsBtn = document.getElementById('tabSettingsBtn');
    const tabTripsView = document.getElementById('tabTripsView');
    const tabSettingsView = document.getElementById('tabSettingsView');
    const dashboardSettingsForm = document.getElementById('dashboardSettingsForm');
    const dashLogoutBtn = document.getElementById('dashLogoutBtn');

    const renderDashboard = () => {
        if (!window.WanderData) return;
        const user = window.WanderData.getCurrentUser();
        if (!user) {
            window.location.href = "signup.html";
            return;
        }

        // Fill profile banner details
        const dashWelcomeName = document.getElementById('dashWelcomeName');
        const dashUserPlan = document.getElementById('dashUserPlan');
        if (dashWelcomeName) dashWelcomeName.textContent = `Hello, ${user.name}`;
        if (dashUserPlan) dashUserPlan.textContent = `${user.plan} Active`;

        // Fill Settings Form
        const settingsName = document.getElementById('settingsName');
        const settingsEmail = document.getElementById('settingsEmail');
        if (settingsName) settingsName.value = user.name;
        if (settingsEmail) settingsEmail.value = user.email;

        // Render Bookings List
        const bookings = window.WanderData.getBookings();
        const upcoming = bookings.filter(b => b.status === 'upcoming');
        const past = bookings.filter(b => b.status === 'completed' || b.status === 'past');

        // Upcoming bookings
        if (dashboardUpcomingTrips) {
            if (upcoming.length === 0) {
                dashboardUpcomingTrips.innerHTML = `
                    <div style="text-align: center; padding: 32px 16px; border: 1px dashed var(--gray-300); border-radius: var(--radius-lg); color: var(--gray-500);">
                        No upcoming adventures planned. <a href="booking.html" style="color:var(--primary); font-weight:600;">Explore destinations</a> to book your next trip!
                    </div>
                `;
            } else {
                dashboardUpcomingTrips.innerHTML = upcoming.map(b => `
                    <div class="trip-row-card">
                        <img src="${b.destinationImage}" class="trip-row-img" alt="${b.destinationName}">
                        <div>
                            <h4 style="font-weight: 700; color: var(--gray-900); font-size: 1.1rem;">Trip to ${b.destinationName}</h4>
                            <p style="font-size: 0.85rem; color: var(--gray-500); margin-top: 2px;">
                                ${b.startDate} to ${b.endDate} • ${b.guests} guest${b.guests > 1 ? 's' : ''}
                            </p>
                            <div style="font-size: 0.8rem; color: var(--gray-400); margin-top: 4px;">Booking ID: <strong>${b.id}</strong></div>
                        </div>
                        <div style="text-align: right;">
                            <span class="trip-row-badge upcoming">Confirmed</span>
                            <div style="font-weight: 700; color: var(--gray-900); margin-top: 8px; font-size: 1.1rem;">$${b.totalAmount.toLocaleString()}</div>
                        </div>
                    </div>
                `).join('');
            }
        }

        // Past bookings
        if (dashboardPastTrips) {
            if (past.length === 0) {
                dashboardPastTrips.innerHTML = `
                    <div style="color: var(--gray-400); font-size: 0.85rem; font-style: italic;">
                        No past trips recorded.
                    </div>
                `;
            } else {
                dashboardPastTrips.innerHTML = past.map(b => `
                    <div class="trip-row-card">
                        <img src="${b.destinationImage}" class="trip-row-img" alt="${b.destinationName}">
                        <div>
                            <h4 style="font-weight: 700; color: var(--gray-700);">${b.destinationName}</h4>
                            <p style="font-size: 0.85rem; color: var(--gray-500);">${b.startDate} to ${b.endDate}</p>
                        </div>
                        <div>
                            <span class="trip-row-badge completed">Completed</span>
                        </div>
                    </div>
                `).join('');
            }
        }
        refreshIcons();
    };

    // Tab Switches
    if (tabTripsBtn && tabSettingsBtn && tabTripsView && tabSettingsView) {
        tabTripsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            tabTripsBtn.classList.add('active');
            tabSettingsBtn.classList.remove('active');
            tabTripsView.style.display = 'block';
            tabSettingsView.style.display = 'none';
        });

        tabSettingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            tabSettingsBtn.classList.add('active');
            tabTripsBtn.classList.remove('active');
            tabTripsView.style.display = 'none';
            tabSettingsView.style.display = 'block';
        });
    }

    // Dashboard Account Settings Submit
    if (dashboardSettingsForm && window.WanderData) {
        dashboardSettingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = window.WanderData.getCurrentUser();
            const nameInp = document.getElementById('settingsName');
            if (user && nameInp && nameInp.value) {
                user.name = nameInp.value;
                window.WanderData.setCurrentUser(user);
                window.WanderData.addNotification("Profile Updated", "Your preferred account name has been updated successfully.", "account");
                renderDashboard();
                checkAuthState();
                alert("Account details saved successfully!");
            }
        });
    }

    // Logout from Dashboard
    if (dashLogoutBtn && window.WanderData) {
        dashLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.WanderData.logout();
            window.location.href = "index.html";
        });
    }

    // Load Dashboard View
    if (dashboardUpcomingTrips) {
        renderDashboard();
    }

    // =========================================
    // 11. PRICING SELECTION TRIGGERS
    // =========================================
    document.querySelectorAll('.select-plan-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const plan = btn.getAttribute('data-plan');
            if (!window.WanderData) return;

            const user = window.WanderData.getCurrentUser();
            if (!user) {
                // Not logged in -> go to sign up
                window.location.href = "signup.html";
                return;
            }

            const success = window.WanderData.updateUserPlan(plan);
            if (success) {
                // Dynamic style update
                document.querySelectorAll('.select-plan-btn').forEach(b => {
                    const bp = b.getAttribute('data-plan');
                    b.textContent = `Select ${bp.split(' ')[0]}`;
                    b.classList.remove('btn-primary');
                    b.classList.add('btn-secondary');
                });

                btn.textContent = "Active Plan";
                btn.classList.remove('btn-secondary');
                btn.classList.add('btn-primary');

                alert(`Subscription updated to the ${plan}!`);
                checkAuthState();
            }
        });
    });

    // Mark current active plan as active on load of pricing page
    const checkActivePricingPlan = () => {
        if (!window.WanderData) return;
        const user = window.WanderData.getCurrentUser();
        if (user) {
            document.querySelectorAll('.select-plan-btn').forEach(btn => {
                const plan = btn.getAttribute('data-plan');
                if (user.plan === plan) {
                    btn.textContent = "Active Plan";
                    btn.classList.remove('btn-secondary');
                    btn.classList.add('btn-primary');
                }
            });
        }
    };
    
    if (document.querySelector('.pricing-grid')) {
        checkActivePricingPlan();
    }

    // =========================================
    // 12. SCROLL-REVEAL OBSERVERS
    // =========================================
    const animateElements = document.querySelectorAll(
        '.destination-card, .feature-card, .section-header, .trusted-section, .cta-card, .price-card, .testimonial-card, .mb-section, .color-card, .type-card, .ui-card, .masonry-item'
    );

    if (animateElements.length > 0) {
        const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animateElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(24px)';
            el.style.transition = `opacity 0.6s ease ${index * 0.03}s, transform 0.6s ease ${index * 0.03}s`;
            observer.observe(el);
        });
    }

    // =========================================
    // 13. SIGN UP FORM VALIDATION & REGISTRATION
    // =========================================
    const signupForm = document.getElementById('signup-form');
    if (signupForm && window.WanderData) {
        const nameInp = document.getElementById('fullName');
        const emailInp = document.getElementById('email');
        const passwordInp = document.getElementById('password');
        const confirmPasswordInp = document.getElementById('confirm-password');
        const termsChkbx = document.getElementById('terms');
        const submitBtn = document.getElementById('submit-btn');
        const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
        const loader = submitBtn ? submitBtn.querySelector('.loader') : null;

        const togglePasswordBtn = document.getElementById('toggle-password');
        if (togglePasswordBtn && passwordInp) {
            const iconShow = togglePasswordBtn.querySelector('.icon-show');
            const iconHide = togglePasswordBtn.querySelector('.icon-hide');
            togglePasswordBtn.addEventListener('click', () => {
                const type = passwordInp.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInp.setAttribute('type', type);
                if (iconShow && iconHide) {
                    if (type === 'text') {
                        iconShow.style.display = 'none';
                        iconHide.style.display = 'block';
                    } else {
                        iconShow.style.display = 'block';
                        iconHide.style.display = 'none';
                    }
                }
            });
        }

        const setError = (inputElement, errorMessage) => {
            const group = inputElement.closest('.input-group') || inputElement.closest('.checkbox-group');
            if (!group) return false;
            const errorDiv = group.querySelector('.error-message');
            
            group.classList.remove('has-success');
            if (errorMessage) {
                group.classList.add('has-error');
                if (errorDiv) errorDiv.textContent = errorMessage;
                return false;
            } else {
                group.classList.remove('has-error');
                group.classList.add('has-success');
                if (errorDiv) errorDiv.textContent = '';
                return true;
            }
        };

        const validateEmail = (email) => {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email) return 'Email is required';
            if (!re.test(email)) return 'Please enter a valid email address';
            return '';
        };

        const checkPasswordStrength = (password) => {
            let score = 0;
            if (!password) return { score: 0, text: 'Password is required', color: 'transparent' };
            if (password.length > 5) score += 1;
            if (password.length > 8) score += 1;
            if (/[A-Z]/.test(password)) score += 1;
            if (/[0-9]/.test(password)) score += 1;
            if (/[^A-Za-z0-9]/.test(password)) score += 1;

            if (score <= 2) return { score, text: 'Weak', color: '#EF4444' };
            if (score <= 3) return { score, text: 'Fair', color: '#F59E0B' };
            return { score, text: 'Strong', color: '#10B981' };
        };

        // Real-time listeners
        if (nameInp) {
            nameInp.addEventListener('blur', () => {
                setError(nameInp, nameInp.value ? '' : 'Name is required');
            });
        }
        if (emailInp) {
            emailInp.addEventListener('input', () => {
                setError(emailInp, validateEmail(emailInp.value));
            });
            emailInp.addEventListener('blur', () => {
                setError(emailInp, validateEmail(emailInp.value));
            });
        }
        if (passwordInp) {
            const strengthMeter = document.getElementById('password-strength');
            const strengthFill = document.getElementById('strength-fill');
            const strengthText = document.getElementById('strength-text');

            passwordInp.addEventListener('input', () => {
                const val = passwordInp.value;
                if (strengthMeter) strengthMeter.style.display = val.length > 0 ? 'block' : 'none';
                
                const strength = checkPasswordStrength(val);
                if (strengthFill) {
                    strengthFill.style.width = `${(strength.score / 5) * 100}%`;
                    strengthFill.style.backgroundColor = strength.color;
                }
                if (strengthText) {
                    strengthText.textContent = strength.text;
                    strengthText.style.color = strength.color;
                }

                if (val.length > 0) setError(passwordInp, val.length < 8 ? 'Password must be at least 8 characters' : '');
            });
            passwordInp.addEventListener('blur', () => {
                setError(passwordInp, passwordInp.value.length < 8 ? 'Password must be at least 8 characters' : '');
            });
        }
        if (confirmPasswordInp && passwordInp) {
            confirmPasswordInp.addEventListener('input', () => {
                setError(confirmPasswordInp, confirmPasswordInp.value !== passwordInp.value ? 'Passwords do not match' : '');
            });
            confirmPasswordInp.addEventListener('blur', () => {
                setError(confirmPasswordInp, confirmPasswordInp.value !== passwordInp.value ? 'Passwords do not match' : '');
            });
        }

        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const isNameValid = nameInp ? setError(nameInp, nameInp.value ? '' : 'Name is required') : true;
            const isEmailValid = setError(emailInp, validateEmail(emailInp.value));
            const isPasswordValid = setError(passwordInp, passwordInp.value.length < 8 ? 'Password must be at least 8 characters' : '');
            const isConfirmValid = confirmPasswordInp ? setError(confirmPasswordInp, confirmPasswordInp.value !== passwordInp.value ? 'Passwords do not match' : '') : true;
            const isTermsValid = termsChkbx ? setError(termsChkbx, termsChkbx.checked ? '' : 'You must agree to the Terms & Conditions') : true;

            if (isNameValid && isEmailValid && isPasswordValid && isConfirmValid && isTermsValid) {
                if (submitBtn) submitBtn.disabled = true;
                if (btnText) btnText.style.display = 'none';
                if (loader) loader.style.display = 'inline-block';

                setTimeout(() => {
                    const res = window.WanderData.signup(emailInp.value, passwordInp.value, nameInp ? nameInp.value : '');
                    if (res.success) {
                        const wrapper = document.querySelector('.form-wrapper');
                        if (wrapper) {
                            wrapper.innerHTML = `
                                <div class="success" style="text-align: center; animation: fadeIn 0.4s ease;">
                                    <svg style="color: var(--success); margin-bottom: 1rem;" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                    <h2 style="margin-bottom: 0.5rem; color: var(--gray-900);">Account Created!</h2>
                                    <p style="color: var(--gray-500); margin-bottom: 1.5rem;">Welcome to WanderAI, ${res.user.name}.</p>
                                    <button class="btn-primary" id="signupSuccessBtn" style="margin: 0 auto;">Start Planning</button>
                                </div>
                            `;
                            document.getElementById('signupSuccessBtn').addEventListener('click', () => {
                                window.location.href = "index.html";
                            });
                        }
                    } else {
                        if (submitBtn) submitBtn.disabled = false;
                        if (btnText) btnText.style.display = 'inline';
                        if (loader) loader.style.display = 'none';
                        setError(emailInp, res.message);
                    }
                }, 1500);
            }
        });
    }

    // =========================================
    // 14. LOG IN FORM SUBMISSION
    // =========================================
    const loginForm = document.getElementById('login-form');
    if (loginForm && window.WanderData) {
        const emailInp = document.getElementById('email');
        const passwordInp = document.getElementById('password');
        const submitBtn = document.getElementById('submit-btn');
        const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
        const loader = submitBtn ? submitBtn.querySelector('.loader') : null;

        const setError = (inputElement, errorMessage) => {
            const group = inputElement.closest('.input-group');
            if (!group) return;
            const errorDiv = group.querySelector('.error-message');
            if (errorMessage) {
                group.classList.add('has-error');
                if (errorDiv) errorDiv.textContent = errorMessage;
            } else {
                group.classList.remove('has-error');
                if (errorDiv) errorDiv.textContent = '';
            }
        };

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = emailInp.value;
            const password = passwordInp.value;

            if (!email) {
                setError(emailInp, 'Email is required');
                return;
            }
            if (!password) {
                setError(passwordInp, 'Password is required');
                return;
            }

            if (submitBtn) submitBtn.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (loader) loader.style.display = 'inline-block';

            setTimeout(() => {
                const res = window.WanderData.login(email, password);
                if (res.success) {
                    window.location.href = "index.html";
                } else {
                    if (submitBtn) submitBtn.disabled = false;
                    if (btnText) btnText.style.display = 'inline';
                    if (loader) loader.style.display = 'none';
                    setError(passwordInp, res.message);
                }
            }, 1000);
        });
    }

    // =========================================
    // 15. BOOKING.COM / KAYAK / MAKEMYTRIP LANDING PAGE LOGIC
    // =========================================

    // Top Utility Dropdowns (Currency & Language)
    const initTopUtility = () => {
        const currencyDropdown = document.getElementById('currencyDropdown');
        const currencyBtn = document.getElementById('currencyBtn');
        const langDropdown = document.getElementById('langDropdown');
        const langBtn = document.getElementById('langBtn');

        if (currencyBtn && currencyDropdown) {
            currencyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (langDropdown) langDropdown.classList.remove('active');
                currencyDropdown.classList.toggle('active');
            });
        }
        if (langBtn && langDropdown) {
            langBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (currencyDropdown) currencyDropdown.classList.remove('active');
                langDropdown.classList.toggle('active');
            });
        }
        document.addEventListener('click', () => {
            if (currencyDropdown) currencyDropdown.classList.remove('active');
            if (langDropdown) langDropdown.classList.remove('active');
        });

        // Currency switch items
        const currencyItems = document.querySelectorAll('#currencyMenu .utility-menu-item');
        currencyItems.forEach(item => {
            item.addEventListener('click', () => {
                currencyItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                const symbol = item.getAttribute('data-symbol');
                const curr = item.getAttribute('data-currency');
                if (currencyBtn) {
                    currencyBtn.innerHTML = `<span class="currency-symbol">${symbol}</span> ${curr} <i data-lucide="chevron-down"></i>`;
                    refreshIcons();
                }
                if (currencyDropdown) currencyDropdown.classList.remove('active');
            });
        });
    };

    // Wishlist Count Sync
    const updateWishlistBadge = () => {
        const wishlistBadge = document.getElementById('navWishlistCount');
        if (wishlistBadge && window.WanderData) {
            const list = window.WanderData.getWishlist();
            wishlistBadge.textContent = list ? list.length : 0;
        }
    };

    // Search Engine Tab Switcher
    const initSearchTabs = () => {
        const tabBtns = document.querySelectorAll('.widget-tab-btn');
        const searchPanels = document.querySelectorAll('.search-panel');
        const serviceTabs = document.querySelectorAll('.service-tab');

        const activateSearchTab = (type) => {
            tabBtns.forEach(btn => {
                if (btn.getAttribute('data-search-type') === type) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            searchPanels.forEach(panel => {
                if (panel.id === `panel-${type}`) {
                    panel.classList.add('active');
                } else {
                    panel.classList.remove('active');
                }
            });
            serviceTabs.forEach(st => {
                if (st.getAttribute('data-tab-target') === type) {
                    st.classList.add('active');
                } else {
                    st.classList.remove('active');
                }
            });
        };

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.getAttribute('data-search-type');
                activateSearchTab(type);
            });
        });

        serviceTabs.forEach(st => {
            st.addEventListener('click', (e) => {
                const target = st.getAttribute('data-tab-target');
                if (document.getElementById(`panel-${target}`)) {
                    e.preventDefault();
                    activateSearchTab(target);
                    document.getElementById('search-hero').scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    };

    // Guests & Rooms Counter Popover
    const initGuestCounterPopover = () => {
        const trigger = document.getElementById('guestsTriggerBtn');
        const popover = document.getElementById('guestsPopover');
        const doneBtn = document.getElementById('guestsDoneBtn');
        const displayInput = document.getElementById('guestsDisplayInput');

        if (!trigger || !popover) return;

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            popover.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (popover && !popover.contains(e.target) && !trigger.contains(e.target)) {
                popover.classList.remove('active');
            }
        });

        let adults = 2;
        let children = 0;
        let rooms = 1;

        const adultCountEl = document.getElementById('adultCount');
        const childCountEl = document.getElementById('childCount');
        const roomCountEl = document.getElementById('roomCount');

        const updateDisplay = () => {
            if (adultCountEl) adultCountEl.textContent = adults;
            if (childCountEl) childCountEl.textContent = children;
            if (roomCountEl) roomCountEl.textContent = rooms;
            if (displayInput) displayInput.value = `${adults} Adult${adults > 1 ? 's' : ''} · ${children} Child${children !== 1 ? 'ren' : ''} · ${rooms} Room${rooms > 1 ? 's' : ''}`;
        };

        document.getElementById('adultPlus')?.addEventListener('click', () => { adults++; updateDisplay(); });
        document.getElementById('adultMinus')?.addEventListener('click', () => { if (adults > 1) { adults--; updateDisplay(); } });
        document.getElementById('childPlus')?.addEventListener('click', () => { children++; updateDisplay(); });
        document.getElementById('childMinus')?.addEventListener('click', () => { if (children > 0) { children--; updateDisplay(); } });
        document.getElementById('roomPlus')?.addEventListener('click', () => { rooms++; updateDisplay(); });
        document.getElementById('roomMinus')?.addEventListener('click', () => { if (rooms > 1) { rooms--; updateDisplay(); } });

        if (doneBtn) {
            doneBtn.addEventListener('click', () => {
                popover.classList.remove('active');
            });
        }
    };

    // Swap Flights Origin and Destination
    const initFlightSwap = () => {
        const swapBtn = document.getElementById('swapFlightBtn');
        const fromInput = document.getElementById('flightFromInput');
        const toInput = document.getElementById('flightToInput');

        if (swapBtn && fromInput && toInput) {
            swapBtn.addEventListener('click', () => {
                const temp = fromInput.value;
                fromInput.value = toInput.value;
                toInput.value = temp;
            });
        }
    };

    // Flatpickr Date Inputs
    const initFlatpickrRange = () => {
        if (typeof flatpickr !== 'undefined') {
            const stayDatesInput = document.getElementById('stayDatesInput');
            if (stayDatesInput) {
                flatpickr(stayDatesInput, {
                    mode: "range",
                    dateFormat: "d M",
                    defaultDate: [new Date(), new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)]
                });
            }
            const flightDatesInput = document.getElementById('flightDatesInput');
            if (flightDatesInput) {
                flatpickr(flightDatesInput, {
                    mode: "range",
                    dateFormat: "d M",
                    defaultDate: [new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
                });
            }
        }
    };

    // Autocomplete Dropdown for Stays Input
    const initAutocompleteDropdown = () => {
        const input = document.getElementById('stayDestinationInput');
        const dropdown = document.getElementById('stayAutocompleteDropdown');
        if (!input || !dropdown || !window.WanderData) return;

        const destinations = window.WanderData.getDestinations();

        input.addEventListener('focus', () => {
            renderAutocomplete(input.value);
        });

        input.addEventListener('input', () => {
            renderAutocomplete(input.value);
        });

        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });

        function renderAutocomplete(val) {
            const query = val.toLowerCase().trim();
            const filtered = destinations.filter(d =>
                d.name.toLowerCase().includes(query) ||
                d.country.toLowerCase().includes(query)
            );

            if (filtered.length === 0) {
                dropdown.style.display = 'none';
                return;
            }

            dropdown.innerHTML = filtered.slice(0, 5).map(d => `
                <div class="autocomplete-item" data-name="${d.name}, ${d.country}">
                    <i data-lucide="map-pin" style="width:16px; height:16px; color:var(--brand-blue);"></i>
                    <div>
                        <strong>${d.name}</strong>, ${d.country}
                    </div>
                </div>
            `).join('');

            dropdown.style.display = 'block';
            refreshIcons();

            dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
                item.addEventListener('click', () => {
                    input.value = item.getAttribute('data-name');
                    dropdown.style.display = 'none';
                });
            });
        }
    };

    // Trending Destinations Portal Grid Rendering
    const renderTrendingDestinations = (category = 'all') => {
        const container = document.getElementById('destinationsContainer');
        if (!container || !window.WanderData) return;

        const destinations = window.WanderData.getDestinations();
        const filtered = category === 'all' ? destinations : destinations.filter(d => d.category === category);

        container.innerHTML = filtered.map(d => {
            const isWishlisted = window.WanderData.isWishlisted(d.id);
            return `
                <div class="portal-dest-card">
                    <div class="card-img-wrapper">
                        <img src="${d.image}" alt="${d.name}" class="portal-card-img">
                        <button class="card-wishlist-btn ${isWishlisted ? 'active' : ''}" data-id="${d.id}" title="Save to Wishlist">
                            <i data-lucide="heart" fill="${isWishlisted ? 'currentColor' : 'none'}"></i>
                        </button>
                        <span class="portal-tag-badge">${d.category.toUpperCase()} · ${d.duration} DAYS</span>
                    </div>
                    <div class="portal-card-body">
                        <div class="card-rating-row">
                            <span class="rating-pill">★ ${d.rating}</span>
                            <span class="card-reviews-text">(${d.reviewsCount} reviews)</span>
                        </div>
                        <h3 class="portal-card-title">${d.name}</h3>
                        <p class="portal-card-country">${d.country}</p>
                        <div class="portal-card-footer">
                            <div>
                                <div class="card-price-label">Starting from</div>
                                <div class="card-price-amount">$${d.price}</div>
                            </div>
                            <a href="booking.html?id=${d.id}" class="card-view-btn">View Deal</a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        refreshIcons();

        // Wishlist click handler
        container.querySelectorAll('.card-wishlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                const added = window.WanderData.toggleWishlist(id);
                btn.classList.toggle('active', added);
                const heartIcon = btn.querySelector('i');
                if (heartIcon) {
                    heartIcon.setAttribute('fill', added ? 'currentColor' : 'none');
                }
                updateWishlistBadge();
            });
        });
    };

    // Bind Category Filter Pills
    const initCategoryFilterPills = () => {
        const pills = document.querySelectorAll('#destinationCategoryTabs .cat-pill');
        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                pills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                const cat = pill.getAttribute('data-cat');
                renderTrendingDestinations(cat);
            });
        });
    };

    // Live AI Itinerary Playground Controller
    const renderAiPlayground = () => {
        const pillsBar = document.getElementById('aiPromptPills');
        const previewContainer = document.getElementById('aiPreviewCard');
        if (!pillsBar || !previewContainer || !window.WanderData) return;

        const itineraries = window.WanderData.getAiItineraries();
        if (!itineraries || itineraries.length === 0) return;

        const displayItinerary = (id) => {
            const item = itineraries.find(it => it.id === id) || itineraries[0];

            previewContainer.innerHTML = `
                <div class="ai-preview-grid">
                    <div class="preview-left-card">
                        <img src="${item.image}" alt="${item.title}" class="preview-img">
                        <div class="preview-img-overlay"></div>
                        <div class="preview-meta-content">
                            <span class="meta-tag">${item.tag} · ${item.style}</span>
                            <h3 class="preview-title">${item.title}</h3>
                            <div class="preview-stats-row">
                                <span><i data-lucide="clock"></i> ${item.duration}</span>
                                <span><i data-lucide="dollar-sign"></i> Est. ${item.estBudget}</span>
                                <span><i data-lucide="sun"></i> ${item.bestSeason}</span>
                            </div>
                        </div>
                    </div>
                    <div class="preview-right-timeline">
                        ${item.days.map(d => `
                            <div class="timeline-day-item">
                                <div class="day-num-tag">DAY ${d.day}</div>
                                <div class="day-title">${d.title}</div>
                                <div class="day-desc">${d.detail}</div>
                            </div>
                        `).join('')}
                        <div class="ai-action-bar">
                            <a href="booking.html" class="btn-primary btn-lg ai-gradient-btn">
                                <i data-lucide="sparkles"></i> Customize This Plan with AI
                            </a>
                        </div>
                    </div>
                </div>
            `;
            refreshIcons();
        };

        // Display default itinerary
        displayItinerary('kyoto-7d');

        // Handle prompt pill clicks
        const pills = pillsBar.querySelectorAll('.prompt-pill');
        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                pills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                const id = pill.getAttribute('data-itinerary-id');
                displayItinerary(id);
            });
        });
    };

    // Render Property Types Grid
    const renderPropertyTypes = () => {
        const grid = document.getElementById('propertyTypesGrid');
        if (!grid || !window.WanderData) return;

        const types = window.WanderData.getPropertyTypes();
        grid.innerHTML = types.map(t => `
            <div class="property-type-card" onclick="window.location.href='booking.html';">
                <div class="property-icon-wrap">
                    <i data-lucide="${t.icon}"></i>
                </div>
                <div class="property-title">${t.name}</div>
                <div class="property-count">${t.count} properties</div>
            </div>
        `).join('');
        refreshIcons();
    };

    // Render Promo Offers Grid
    const renderOffers = () => {
        const grid = document.getElementById('offersGrid');
        if (!grid || !window.WanderData) return;

        const offers = window.WanderData.getOffers();
        grid.innerHTML = offers.map(o => `
            <div class="offer-card">
                <div>
                    <span class="offer-badge">${o.badge}</span>
                    <div class="offer-discount">${o.discount}</div>
                    <div class="offer-title">${o.title}</div>
                    <div class="offer-desc">${o.desc}</div>
                </div>
                <div class="offer-code-bar">
                    <span>${o.code}</span>
                    <button class="copy-code-btn" onclick="navigator.clipboard.writeText('${o.code}'); alert('Promo code ${o.code} copied!');">
                        Copy Code
                    </button>
                </div>
            </div>
        `).join('');
    };

    // Checkout Promo Code Handler
    const initCheckoutPromo = () => {
        const applyBtn = document.getElementById('applyPromoBtn');
        const input = document.getElementById('promoCodeInput');
        const notice = document.getElementById('promoNotice');
        const discountEl = document.getElementById('summaryDiscount');
        const totalEl = document.getElementById('summaryTotal');
        const baseEl = document.getElementById('summaryBasePrice');

        if (applyBtn && input && notice) {
            applyBtn.addEventListener('click', () => {
                const code = input.value.trim().toUpperCase();
                if (code === 'WANDERAI20' || code === 'GENIUS15' || code === 'FLYAI10') {
                    notice.style.color = 'var(--success)';
                    notice.textContent = `Promo code ${code} applied successfully!`;
                    if (discountEl && baseEl && totalEl) {
                        const base = parseFloat(baseEl.textContent.replace(/[^0-9.]/g, '')) || 1000;
                        const disc = Math.round(base * 0.2);
                        discountEl.textContent = `-$${disc}`;
                        const taxes = Math.round(base * 0.12);
                        totalEl.textContent = `$${base - disc + taxes}`;
                    }
                } else {
                    notice.style.color = 'var(--accent)';
                    notice.textContent = 'Invalid promo code. Try WANDERAI20';
                }
            });
        }
    };

    // Pricing Annual Toggle Switch
    const initPricingToggle = () => {
        const toggle = document.getElementById('pricingAnnualToggle');
        const nomadPrice = document.getElementById('nomadPriceText');
        const atlasPrice = document.getElementById('atlasPriceText');

        if (toggle && nomadPrice && atlasPrice) {
            toggle.addEventListener('change', () => {
                if (toggle.checked) {
                    nomadPrice.innerHTML = '$9.60<span class="period">/mo (billed annually)</span>';
                    atlasPrice.innerHTML = '$23.20<span class="period">/mo (billed annually)</span>';
                } else {
                    nomadPrice.innerHTML = '$12<span class="period">/mo</span>';
                    atlasPrice.innerHTML = '$29<span class="period">/mo</span>';
                }
            });
        }
    };

    // Interactive Demo Payment System Controller (checkout.html)
    const initDemoPaymentSystem = () => {
        const checkoutForm = document.getElementById('checkoutPaymentForm');
        if (!checkoutForm) return;

        const summaryImg = document.getElementById('summaryImg');
        const summaryTitle = document.getElementById('summaryTitle');
        const summaryCountry = document.getElementById('summaryCountry');
        const summaryDuration = document.getElementById('summaryDuration');
        const summaryStart = document.getElementById('summaryStart');
        const summaryEnd = document.getElementById('summaryEnd');
        const summaryGuests = document.getElementById('summaryGuests');
        const summaryBasePrice = document.getElementById('summaryBasePrice');
        const summaryDiscount = document.getElementById('summaryDiscount');
        const summaryTaxes = document.getElementById('summaryTaxes');
        const summaryTotal = document.getElementById('summaryTotal');
        const demoOverlay = document.getElementById('demoPaymentOverlay');
        const demoCloseBtn = document.getElementById('demoPaymentClose');
        const demoPayConfirmBtn = document.getElementById('demoPayConfirmBtn');
        const demoPayTotalText = document.getElementById('demoPayTotalText');

        // Load pending booking from localStorage or default
        let pendingBooking = null;
        try {
            const stored = localStorage.getItem('pendingBooking');
            if (stored) pendingBooking = JSON.parse(stored);
        } catch (e) {
            console.error(e);
        }

        if (!pendingBooking) {
            pendingBooking = {
                id: 'kyoto',
                title: 'Kyoto Cultural Immersion & Bamboo Grove',
                country: 'Japan',
                image: 'images/Kyoto, Japan.png',
                duration: '7 days',
                startDate: '2026-08-10',
                endDate: '2026-08-17',
                guests: 2,
                basePrice: 1400
            };
        }

        if (summaryImg) summaryImg.src = pendingBooking.image || 'images/Kyoto, Japan.png';
        if (summaryTitle) summaryTitle.textContent = pendingBooking.title || 'Kyoto Cultural Immersion';
        if (summaryCountry) summaryCountry.textContent = pendingBooking.country || 'Japan';
        if (summaryDuration) summaryDuration.textContent = pendingBooking.duration || '7 days';
        if (summaryStart) summaryStart.textContent = pendingBooking.startDate || '2026-08-10';
        if (summaryEnd) summaryEnd.textContent = pendingBooking.endDate || '2026-08-17';
        if (summaryGuests) summaryGuests.textContent = `${pendingBooking.guests || 2} Guests`;

        const basePrice = pendingBooking.basePrice || 1400;
        const discount = Math.round(basePrice * 0.15);
        const taxes = Math.round(basePrice * 0.12);
        const totalPrice = basePrice - discount + taxes;

        if (summaryBasePrice) summaryBasePrice.textContent = `$${basePrice}`;
        if (summaryDiscount) summaryDiscount.textContent = `-$${discount}`;
        if (summaryTaxes) summaryTaxes.textContent = `$${taxes}`;
        if (summaryTotal) summaryTotal.textContent = `$${totalPrice}`;
        if (demoPayTotalText) demoPayTotalText.textContent = `$${totalPrice}`;

        // Payment Tabs Switcher
        const tabs = document.querySelectorAll('.demo-payment-tab');
        const sections = document.querySelectorAll('.demo-payment-section');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                sections.forEach(s => s.classList.remove('active'));
                tab.classList.add('active');
                const targetId = `demoPay-${tab.getAttribute('data-pay-method')}`;
                const targetSection = document.getElementById(targetId);
                if (targetSection) targetSection.classList.add('active');
            });
        });

        // Form Submit -> Opens Gateway Overlay
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('billName');
            const emailInput = document.getElementById('billEmail');
            const phoneInput = document.getElementById('billPhone');
            let isValid = true;

            if (!nameInput.value.trim()) {
                const err = document.getElementById('billName-error');
                if (err) err.textContent = 'Please enter your full name';
                isValid = false;
            } else {
                const err = document.getElementById('billName-error');
                if (err) err.textContent = '';
            }

            if (!emailInput.value.trim() || !emailInput.value.includes('@')) {
                const err = document.getElementById('billEmail-error');
                if (err) err.textContent = 'Please enter a valid email address';
                isValid = false;
            } else {
                const err = document.getElementById('billEmail-error');
                if (err) err.textContent = '';
            }

            if (!phoneInput.value.trim()) {
                const err = document.getElementById('billPhone-error');
                if (err) err.textContent = 'Please enter mobile number';
                isValid = false;
            } else {
                const err = document.getElementById('billPhone-error');
                if (err) err.textContent = '';
            }

            if (isValid && demoOverlay) {
                demoOverlay.classList.add('active');
            }
        });

        // Close Gateway Modal
        if (demoCloseBtn && demoOverlay) {
            demoCloseBtn.addEventListener('click', () => {
                demoOverlay.classList.remove('active');
            });
        }

        // Confirm Demo Payment Click
        if (demoPayConfirmBtn) {
            demoPayConfirmBtn.addEventListener('click', () => {
                const btnText = demoPayConfirmBtn.querySelector('.btn-text');
                const loader = demoPayConfirmBtn.querySelector('.loader');

                if (btnText) btnText.innerHTML = 'Authorizing Payment...';
                if (loader) loader.style.display = 'inline-block';
                demoPayConfirmBtn.disabled = true;

                setTimeout(() => {
                    if (demoOverlay) demoOverlay.classList.remove('active');

                    const confirmedBooking = {
                        id: 'booking-' + Date.now(),
                        destinationId: pendingBooking.id || 'kyoto',
                        title: pendingBooking.title || 'Kyoto Cultural Immersion',
                        country: pendingBooking.country || 'Japan',
                        image: pendingBooking.image || 'images/Kyoto, Japan.png',
                        startDate: pendingBooking.startDate || '2026-08-10',
                        endDate: pendingBooking.endDate || '2026-08-17',
                        guests: pendingBooking.guests || 2,
                        totalPrice: summaryTotal ? summaryTotal.textContent : `$${totalPrice}`,
                        status: 'Confirmed',
                        bookedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    };

                    if (window.WanderData && window.WanderData.saveBooking) {
                        window.WanderData.saveBooking(confirmedBooking);
                    }

                    const successToast = document.getElementById('bookingSuccessToast');
                    const overlay = document.getElementById('bookingOverlay');
                    if (successToast && overlay) {
                        overlay.classList.add('active');
                        successToast.classList.add('active');
                        const progressFill = successToast.querySelector('.toast-progress-fill');
                        if (progressFill) progressFill.style.width = '100%';
                    }

                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 2000);
                }, 1500);
            });
        }
    };

    // User Dashboard Controller (dashboard.html)
    const initDashboardView = () => {
        const upcomingContainer = document.getElementById('dashboardUpcomingTrips');
        const pastContainer = document.getElementById('dashboardPastTrips');
        if (!upcomingContainer || !pastContainer || !window.WanderData) return;

        const bookings = window.WanderData.getBookings();

        if (bookings.length === 0) {
            upcomingContainer.innerHTML = `
                <div style="background:#FFF; padding:32px; border-radius:12px; border:1px solid var(--gray-200); text-align:center;">
                    <p style="color:var(--gray-500);">No upcoming bookings found. <a href="booking.html" style="color:var(--brand-blue); font-weight:700;">Explore Destinations</a></p>
                </div>
            `;
            pastContainer.innerHTML = `<p style="color:var(--gray-500); font-size:0.9rem;">No past trips recorded.</p>`;
            return;
        }

        upcomingContainer.innerHTML = bookings.map(b => `
            <div class="checkout-card" style="display:flex; justify-content:space-between; align-items:center; gap:20px;">
                <div style="display:flex; gap:16px; align-items:center;">
                    <img src="${b.image}" alt="${b.title}" style="width:100px; height:80px; object-fit:cover; border-radius:10px;">
                    <div>
                        <span class="genius-badge" style="margin-bottom:4px; display:inline-block;">${b.status.toUpperCase()}</span>
                        <h4 style="font-size:1.15rem; font-weight:800; color:var(--gray-900);">${b.title}</h4>
                        <p style="font-size:0.85rem; color:var(--gray-500);">${b.country} · ${b.startDate} to ${b.endDate}</p>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:1.2rem; font-weight:900; color:var(--brand-blue);">${b.totalPrice}</div>
                    <span style="font-size:0.8rem; color:var(--gray-400);">Booked on ${b.bookedAt}</span>
                </div>
            </div>
        `).join('');

        pastContainer.innerHTML = `
            <div class="checkout-card" style="display:flex; justify-content:space-between; align-items:center; opacity:0.8;">
                <div style="display:flex; gap:16px; align-items:center;">
                    <img src="images/Santorini, Greece.png" alt="Santorini" style="width:80px; height:60px; object-fit:cover; border-radius:8px;">
                    <div>
                        <h4 style="font-size:1rem; font-weight:800; color:var(--gray-900);">Santorini Luxury Villa Escape</h4>
                        <p style="font-size:0.8rem; color:var(--gray-500);">Greece · Completed May 2025</p>
                    </div>
                </div>
                <span class="rating-pill">★ 5.0 Completed</span>
            </div>
        `;
    };

    // Execute Landing Page Component Initializations
    initTopUtility();
    updateWishlistBadge();
    initSearchTabs();
    initGuestCounterPopover();
    initFlightSwap();
    initFlatpickrRange();
    initAutocompleteDropdown();
    renderTrendingDestinations('all');
    initCategoryFilterPills();
    renderAiPlayground();
    renderPropertyTypes();
    renderOffers();
    initCheckoutPromo();
    initPricingToggle();
    initDemoPaymentSystem();
    initDashboardView();

});


