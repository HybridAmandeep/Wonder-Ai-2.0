/**
 * WanderAI – Central Data Layer
 * Persisted in localStorage. Accessible globally via window.WanderData.
 */
(function () {
    const DESTINATIONS = [
        {
            id: "santorini",
            name: "Santorini",
            country: "Greece",
            price: 1299,
            duration: 5,
            rating: 4.9,
            reviewsCount: "2.4k",
            description: "Famous for its dramatic views, whitewashed houses with blue domes, active volcano, and stunning sunsets over the Aegean Sea.",
            image: "images/Santorini, Greece.png", // Base image, we can enrich with online source or fallbacks
            category: "beach",
            bestSeason: "May to October",
            coordinates: { lat: 36.4166, lon: 25.4324 },
            activities: ["Sunset sailing in Oia", "Volcano & hot springs tour", "Wine tasting", "Akrotiri archaeological site tour"]
        },
        {
            id: "kyoto",
            name: "Kyoto",
            country: "Japan",
            price: 1599,
            duration: 7,
            rating: 4.8,
            reviewsCount: "1.8k",
            description: "The historical heart of Japan, famous for its thousands of classical Buddhist temples, gardens, imperial palaces, Shinto shrines, and traditional wooden houses.",
            image: "images/Kyoto, Japan.png",
            category: "culture",
            bestSeason: "October to November (Autumn) & April (Cherry Blossoms)",
            coordinates: { lat: 35.0116, lon: 135.7681 },
            activities: ["Arashiyama Bamboo Grove walk", "Fushimi Inari Shrine hike", "Kinkaku-ji (Golden Pavilion) visit", "Traditional tea ceremony"]
        },
        {
            id: "maldives",
            name: "Maldives",
            country: "Maldives",
            price: 2199,
            duration: 6,
            rating: 4.9,
            reviewsCount: "3.1k",
            description: "A tropical nation in the Indian Ocean composed of 26 ring-shaped atolls, which are made up of more than 1,000 coral islands. Renowned for its beaches, blue lagoons, and extensive reefs.",
            image: "images/Maldives, Maldives.png",
            category: "beach",
            bestSeason: "November to April",
            coordinates: { lat: 3.2028, lon: 73.2207 },
            activities: ["Snorkeling with manta rays", "Overwater villa stay", "Sunset dolphin cruise", "Private sandbar dinner"]
        },
        {
            id: "swiss-alps",
            name: "Swiss Alps",
            country: "Switzerland",
            price: 1899,
            duration: 5,
            rating: 4.7,
            reviewsCount: "1.2k",
            description: "Breathtaking mountain range offering world-class skiing, hiking, mountaineering, and scenic train rides through pristine valley landscapes and snow-capped peaks.",
            image: "images/Swiss Alps, Switzerland.png",
            category: "adventure",
            bestSeason: "December to March (Skiing) & June to September (Hiking)",
            coordinates: { lat: 46.8182, lon: 8.2275 },
            activities: ["Jungfraujoch Sphinx Observatory visit", "Zermatt paragliding", "Glacier Express train journey", "Lake Geneva boat cruise"]
        },
        {
            id: "bali",
            name: "Bali",
            country: "Indonesia",
            price: 999,
            duration: 8,
            rating: 4.8,
            reviewsCount: "2.7k",
            description: "Known for its forested volcanic mountains, iconic rice paddies, beaches, coral reefs, and rich spiritual culture with thousands of unique temples.",
            image: "images/Bali, Indonesia.png",
            category: "nature",
            bestSeason: "April to October",
            coordinates: { lat: -8.4095, lon: 115.1889 },
            activities: ["Tegallalang Rice Terrace tour", "Uluwatu Temple sunset dance", "Scuba diving in Tulamben", "Mount Batur sunrise trek"]
        },
        {
            id: "reykjavik",
            name: "Reykjavik & Northern Lights",
            country: "Iceland",
            price: 1799,
            duration: 5,
            rating: 4.8,
            reviewsCount: "1.5k",
            description: "Experience the magic of Iceland. Discover geothermal geysers, black sand beaches, majestic waterfalls, and view the aurora borealis dancing across the arctic sky.",
            image: "images/Reykjavik & Northern Lights, Iceland.png",
            category: "adventure",
            bestSeason: "September to April",
            coordinates: { lat: 64.1466, lon: -21.9426 },
            activities: ["Northern Lights hunting tour", "Golden Circle route tour", "Blue Lagoon thermal spa soak", "Black Sand Beach walk in Vik"]
        },
        {
            id: "petra",
            name: "Petra Ancient City",
            country: "Jordan",
            price: 1499,
            duration: 4,
            rating: 4.9,
            reviewsCount: "1.1k",
            description: "A famous archaeological site in Jordan's southwestern desert. Dating to around 300 B.C., it was the capital of the Nabataean Kingdom. It contains tombs and temples carved into pink sandstone cliffs.",
            image: "images/Petra Ancient City, Jordan.png",
            category: "culture",
            bestSeason: "March to May & September to November",
            coordinates: { lat: 30.3285, lon: 35.4444 },
            activities: ["Treasury (Al-Khazneh) walk", "Petra by Night candlelit tour", "Monastery hiking trail climb", "Wadi Rum desert jeep safari"]
        },
        {
            id: "banff",
            name: "Banff National Park",
            country: "Canada",
            price: 1399,
            duration: 6,
            rating: 4.8,
            reviewsCount: "1.9k",
            description: "Canada's oldest national park, nestled in the Rocky Mountains. Famous for its surreal turquoise glacial lakes (Lake Louise, Moraine Lake), abundant wildlife, and outdoor pursuits.",
            image: "images/Banff National Park, Canada.png",
            category: "nature",
            bestSeason: "June to August (Lakes) & December to April (Skiing)",
            coordinates: { lat: 51.4968, lon: -115.9281 },
            activities: ["Moraine Lake canoeing", "Banff Gondola ride", "Johnston Canyon ice walk", "Icefields Parkway road trip"]
        },
        {
            id: "cairo",
            name: "The Giza Pyramids & Cairo",
            country: "Egypt",
            price: 1199,
            duration: 5,
            rating: 4.7,
            reviewsCount: "2.1k",
            description: "Explore the ancient wonders of Egypt, including the Great Sphinx, the Giza Pyramids, and the vast historical treasures of the Grand Egyptian Museum on the banks of the Nile.",
            image: "images/The Giza Pyramids & Cairo, Egypt.png",
            category: "culture",
            bestSeason: "October to April",
            coordinates: { lat: 30.0444, lon: 31.2357 },
            activities: ["Giza Pyramids & Sphinx camel ride", "Nile River felucca cruise", "Khan el-Khalili bazaar shopping", "Egyptian Museum guided tour"]
        },
        {
            id: "queenstown",
            name: "Queenstown Adventure",
            country: "New Zealand",
            price: 1999,
            duration: 7,
            rating: 4.9,
            reviewsCount: "1.6k",
            description: "The adventure capital of the world, Queenstown sits on the shores of Lake Wakatipu against the dramatic Southern Alps. Popular for bungee jumping, jet boating, and skiing.",
            image: "images/Queenstown Adventure, New Zealand.png",
            category: "adventure",
            bestSeason: "December to February (Summer) & June to August (Winter)",
            coordinates: { lat: -45.0312, lon: 168.6626 },
            activities: ["Shotover Jet boat ride", "Milford Sound day tour", "Bungee jumping at Kawarau Bridge", "Coronet Peak night skiing"]
        },
        {
            id: "amalfi",
            name: "Amalfi Coast",
            country: "Italy",
            price: 1699,
            duration: 6,
            rating: 4.8,
            reviewsCount: "2.3k",
            description: "A 50-kilometer stretch of coastline along the southern edge of Italy's Sorrentine Peninsula. Famous for its sheer cliffs, rugged shoreline, pastel-colored fishing villages, and terraced vineyards.",
            image: "images/Amalfi Coast, Italy.png",
            category: "beach",
            bestSeason: "May to September",
            coordinates: { lat: 40.6331, lon: 14.6027 },
            activities: ["Path of the Gods hike", "Positano boat charter", "Limoncello tasting in Amalfi", "Ravello villa gardens tour"]
        },
        {
            id: "serengeti",
            name: "Serengeti National Park",
            country: "Tanzania",
            price: 2499,
            duration: 6,
            rating: 4.9,
            reviewsCount: "1.4k",
            description: "A vast African savanna ecosystem renowned for its annual wildebeest migration, massive herds of zebras, gazelles, and the highest concentration of large predators in Africa.",
            image: "images/Serengeti National Park, Tanzania.png",
            category: "nature",
            bestSeason: "January to March & June to October",
            coordinates: { lat: -2.1540, lon: 34.6857 },
            activities: ["Serengeti hot air balloon safari", "Game drive to track the Big Five", "Maasai village cultural visit", "Great Migration river crossing viewing"]
        }
    ];

    // Initialize local storage keys if they don't exist
    if (!localStorage.getItem('users')) localStorage.setItem('users', JSON.stringify([]));
    if (!localStorage.getItem('currentUser')) localStorage.setItem('currentUser', 'null');
    if (!localStorage.getItem('wishlist')) localStorage.setItem('wishlist', JSON.stringify([]));
    if (!localStorage.getItem('bookings')) localStorage.setItem('bookings', JSON.stringify([]));
    if (!localStorage.getItem('notifications')) {
        const welcomeNotifs = [
            {
                id: "notif_welcome",
                title: "Welcome to WanderAI!",
                message: "Start exploring destinations, build your dream itinerary, and book your next trip.",
                timestamp: new Date().toISOString(),
                unread: true,
                type: "welcome"
            }
        ];
        localStorage.setItem('notifications', JSON.stringify(welcomeNotifs));
    }

    // Sample AI Itineraries for Interactive Playground
    const AI_ITINERARIES = [
        {
            id: "kyoto-7d",
            title: "Kyoto Temple & Culinary Discovery",
            destination: "Kyoto, Japan",
            duration: "7 Days",
            style: "Culture & Food",
            tag: "Bestseller",
            image: "images/Kyoto, Japan.png",
            estBudget: "$1,599",
            bestSeason: "Mar – May & Oct – Nov",
            days: [
                { day: 1, title: "Arrival & Gion Lantern District Walk", detail: "Check-in at traditional Ryokan, evening strolling through historic Pontocho Alley & Gion." },
                { day: 2, title: "Fushimi Inari Shrine & Tofuku-ji", detail: "Early morning hike through 10,000 torii gates followed by serene zen garden meditation." },
                { day: 3, title: "Arashiyama Bamboo Grove & Monkey Park", detail: "Scenic Sagano romantic train ride and traditional matcha tea ceremony with tea master." },
                { day: 4, title: "Kinkaku-ji & Nijo Castle UNESCO Tour", detail: "Explore Golden Pavilion reflected in mirror pond, nightingale floor acoustics at Nijo Castle." }
            ]
        },
        {
            id: "maldives-5d",
            title: "Maldives Luxury Overwater Escape",
            destination: "Maldives",
            duration: "5 Days",
            style: "Luxury & Romance",
            tag: "Trending",
            image: "images/Maldives, Maldives.png",
            estBudget: "$2,199",
            bestSeason: "Nov – Apr",
            days: [
                { day: 1, title: "Seaplane Transfer & Villa Check-In", detail: "Arrival by glass-bottom seaplane, private infinity pool setup, sunset champagne toast." },
                { day: 2, title: "Manta Ray Snorkeling & Coral Reef Expedition", detail: "Guided marine biologist snorkeling in Baa Atoll UNESCO biosphere reserve." },
                { day: 3, title: "Private Sandbar Picnic & Spa Treatment", detail: "Chef-curated seafood barbecue on isolated sandbank followed by underwater spa massage." },
                { day: 4, title: "Sunset Dolphin Cruise & Undersea Dining", detail: "Sunset cruise watching spinner dolphins, 5-star dinner inside underwater glass restaurant." }
            ]
        },
        {
            id: "swiss-6d",
            title: "Swiss Alps Scenic Rail & Hike Adventure",
            destination: "Swiss Alps, Switzerland",
            duration: "6 Days",
            style: "Adventure & Nature",
            tag: "Popular",
            image: "images/Swiss Alps, Switzerland.png",
            estBudget: "$1,899",
            bestSeason: "Jun – Sep & Dec – Mar",
            days: [
                { day: 1, title: "Zurich to Zermatt Glacier Train", detail: "Scenic panoramic rail ride into the alpine valley with direct Matterhorn mountain views." },
                { day: 2, title: "Gornergrat Railway & Alpine Trail Hike", detail: "Cogwheel train summit ride up to 3,089m elevation with pristine glacial reflection lakes." },
                { day: 3, title: "Jungfraujoch – Top of Europe", detail: "High-altitude ice palace tour, snowfun park, Sphinx observatory views over Aletsch Glacier." },
                { day: 4, title: "Lake Geneva Cruise & Chillon Castle", detail: "Vintage paddle steamer boat cruise on Lake Geneva with Swiss fondue tasting." }
            ]
        },
        {
            id: "santorini-5d",
            title: "Santorini Sunset & Volcanic Island Escape",
            destination: "Santorini, Greece",
            duration: "5 Days",
            style: "Romantic & Beach",
            tag: "Top Rated",
            image: "images/Santorini, Greece.png",
            estBudget: "$1,299",
            bestSeason: "May – Oct",
            days: [
                { day: 1, title: "Oia Cliffside Check-In & Caldera Sunset", detail: "Check into cave suite in Oia, sunset wine tasting overlooking the volcanic Aegean Sea." },
                { day: 2, title: "Catamaran Sailing & Red Beach Snorkeling", detail: "Full day catamaran cruise stopping at Akrotiri Red Beach, White Beach & thermal hot springs." },
                { day: 3, title: "Fira to Oia Ridge Hike & Winery Tour", detail: "Iconic 10km cliffside coastal trail walk followed by Assyrtiko wine pairing." },
                { day: 4, title: "Pyrgos Medieval Village & Ancient Thera", detail: "Explore hilltop fortress ruins, traditional cobblestone alleys, and black sand beach sunset." }
            ]
        }
    ];

    const PROPERTY_TYPES = [
        { id: "hotels", name: "Hotels & Resorts", count: "125,000+", icon: "building", image: "images/Amalfi Coast, Italy.png" },
        { id: "villas", name: "Luxury Villas", count: "42,000+", icon: "home", image: "images/Maldives, Maldives.png" },
        { id: "apartments", name: "City Apartments", count: "89,000+", icon: "layout", image: "images/Kyoto, Japan.png" },
        { id: "cabins", name: "Mountain Cabins", count: "18,000+", icon: "trees", image: "images/Swiss Alps, Switzerland.png" },
        { id: "glamping", name: "Glamping & Domes", count: "9,500+", icon: "tent", image: "images/Banff National Park, Canada.png" },
        { id: "beachfront", name: "Beachfront Bungalows", count: "31,000+", icon: "sun", image: "images/Bali, Indonesia.png" }
    ];

    const OFFERS = [
        {
            code: "WANDERAI20",
            title: "WanderAI Summer Special",
            discount: "20% OFF",
            desc: "On all AI-curated package bookings over $1,000",
            badge: "Limited Time",
            validTill: "Valid till Aug 31"
        },
        {
            code: "GENIUS15",
            title: "Genius Member Deal",
            discount: "15% OFF",
            desc: "Instant member discount on 250,000+ stays worldwide",
            badge: "Member Exclusive",
            validTill: "Always Active"
        },
        {
            code: "FLYAI10",
            title: "Flight + Hotel Combo",
            discount: "$100 OFF",
            desc: "Save big when you bundle flight and hotel in one AI itinerary",
            badge: "Bundle Deal",
            validTill: "Valid till Sep 15"
        }
    ];

    // Main API object exported to window
    const WanderData = {
        getAiItineraries: function () {
            return AI_ITINERARIES;
        },
        getPropertyTypes: function () {
            return PROPERTY_TYPES;
        },
        getOffers: function () {
            return OFFERS;
        },

        // Destination List
        getDestinations: function () {
            return DESTINATIONS;
        },

        getDestinationById: function (id) {
            return DESTINATIONS.find(d => d.id === id) || null;
        },

        // User Auth
        signup: function (email, password, name = '') {
            const users = JSON.parse(localStorage.getItem('users'));
            if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
                return { success: false, message: "User with this email already exists." };
            }
            const newUser = {
                id: "user_" + Math.random().toString(36).substr(2, 9),
                email: email,
                password: password,
                name: name || email.split('@')[0],
                plan: "Explorer ($0/mo)",
                signupDate: new Date().toISOString()
            };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            this.setCurrentUser(newUser);

            // Trigger welcome notification
            this.addNotification(
                "Welcome to WanderAI!",
                `Hi ${newUser.name}, welcome aboard! Choose one of our premium plans to unlock advanced features.`,
                "welcome"
            );

            return { success: true, user: newUser };
        },

        login: function (email, password) {
            const users = JSON.parse(localStorage.getItem('users'));
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
            if (user) {
                this.setCurrentUser(user);
                return { success: true, user: user };
            }
            return { success: false, message: "Invalid email or password." };
        },

        logout: function () {
            localStorage.setItem('currentUser', 'null');
        },

        getCurrentUser: function () {
            const u = localStorage.getItem('currentUser');
            return u === 'null' ? null : JSON.parse(u);
        },

        setCurrentUser: function (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            // Sync user data to users database if fields changed
            if (user) {
                const users = JSON.parse(localStorage.getItem('users'));
                const index = users.findIndex(u => u.id === user.id);
                if (index !== -1) {
                    users[index] = user;
                    localStorage.setItem('users', JSON.stringify(users));
                }
            }
        },

        updateUserPlan: function (planName) {
            const user = this.getCurrentUser();
            if (user) {
                user.plan = planName;
                this.setCurrentUser(user);
                this.addNotification(
                    "Plan Updated Successfully!",
                    `You are now subscribed to the ${planName} plan. Enjoy all its premium benefits!`,
                    "plan"
                );
                return true;
            }
            return false;
        },

        // Wishlist
        getWishlist: function () {
            return JSON.parse(localStorage.getItem('wishlist'));
        },

        toggleWishlist: function (destinationId) {
            const wishlist = this.getWishlist();
            const index = wishlist.indexOf(destinationId);
            let added = false;
            if (index === -1) {
                wishlist.push(destinationId);
                added = true;
                const dest = this.getDestinationById(destinationId);
                if (dest) {
                    this.addNotification(
                        "Added to Wishlist",
                        `${dest.name} has been added to your dream destinations list.`,
                        "wishlist"
                    );
                }
            } else {
                wishlist.splice(index, 1);
            }
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            return added;
        },

        isWishlisted: function (destinationId) {
            const wishlist = this.getWishlist();
            return wishlist.includes(destinationId);
        },

        // Bookings
        getBookings: function () {
            const user = this.getCurrentUser();
            if (!user) return [];
            const allBookings = JSON.parse(localStorage.getItem('bookings'));
            return allBookings.filter(b => b.userId === user.id);
        },

        addBooking: function (destinationId, startDate, endDate, guests, totalAmount, paymentDetails) {
            const user = this.getCurrentUser();
            if (!user) return { success: false, message: "User not logged in." };

            const dest = this.getDestinationById(destinationId);
            if (!dest) return { success: false, message: "Invalid destination." };

            const allBookings = JSON.parse(localStorage.getItem('bookings'));
            const newBooking = {
                id: "BK_" + Math.floor(100000 + Math.random() * 900000),
                userId: user.id,
                destinationId: destinationId,
                destinationName: dest.name,
                destinationImage: dest.image,
                startDate: startDate,
                endDate: endDate,
                guests: parseInt(guests) || 1,
                totalAmount: totalAmount,
                status: "upcoming", // upcoming, completed, cancelled
                bookingDate: new Date().toISOString()
            };

            allBookings.push(newBooking);
            localStorage.setItem('bookings', JSON.stringify(allBookings));

            this.addNotification(
                "Booking Confirmed!",
                `Your trip to ${dest.name} (${startDate} to ${endDate}) is confirmed. Booking ID: ${newBooking.id}`,
                "booking"
            );

            return { success: true, booking: newBooking };
        },

        // Notifications
        getNotifications: function () {
            return JSON.parse(localStorage.getItem('notifications')) || [];
        },

        addNotification: function (title, message, type = "info") {
            const notifications = this.getNotifications();
            notifications.unshift({
                id: "notif_" + Math.random().toString(36).substr(2, 9),
                title: title,
                message: message,
                timestamp: new Date().toISOString(),
                unread: true,
                type: type
            });
            localStorage.setItem('notifications', JSON.stringify(notifications));

            // Dispatch custom event for UI updates
            window.dispatchEvent(new CustomEvent('wanderNotifUpdate'));
        },

        markNotificationsAsRead: function () {
            const notifications = this.getNotifications();
            notifications.forEach(n => n.unread = false);
            localStorage.setItem('notifications', JSON.stringify(notifications));
            window.dispatchEvent(new CustomEvent('wanderNotifUpdate'));
        },

        clearNotifications: function () {
            localStorage.setItem('notifications', JSON.stringify([]));
            window.dispatchEvent(new CustomEvent('wanderNotifUpdate'));
        },

        // Search engine
        search: function (query, options = {}) {
            let results = DESTINATIONS;

            if (query && query.trim() !== '') {
                const q = query.toLowerCase().trim();
                results = results.filter(d =>
                    d.name.toLowerCase().includes(q) ||
                    d.country.toLowerCase().includes(q) ||
                    d.description.toLowerCase().includes(q)
                );
            }

            if (options.category && options.category !== 'all') {
                results = results.filter(d => d.category === options.category);
            }

            if (options.maxPrice) {
                results = results.filter(d => d.price <= options.maxPrice);
            }

            if (options.maxDuration) {
                results = results.filter(d => d.duration <= options.maxDuration);
            }

            if (options.minRating) {
                results = results.filter(d => d.rating >= options.minRating);
            }

            return results;
        },

        getBookings: function () {
            try {
                const stored = localStorage.getItem('userBookings');
                if (stored) return JSON.parse(stored);
            } catch (e) {
                console.error(e);
            }
            return [
                {
                    id: 'booking-101',
                    destinationId: 'kyoto',
                    title: 'Kyoto Cultural Immersion & Bamboo Grove',
                    country: 'Japan',
                    image: 'images/Kyoto, Japan.png',
                    startDate: '2026-08-10',
                    endDate: '2026-08-17',
                    guests: 2,
                    totalPrice: '$1,368',
                    status: 'Confirmed',
                    bookedAt: 'Jul 26, 2026'
                }
            ];
        },

        saveBooking: function (booking) {
            try {
                const bookings = this.getBookings();
                bookings.unshift(booking);
                localStorage.setItem('userBookings', JSON.stringify(bookings));
                return bookings;
            } catch (e) {
                console.error(e);
                return [];
            }
        },

        // Real-world Weather integration (OpenWeatherMap API + rich mock logic)
        getWeather: async function (destinationName, lat, lon) {
            try {
                const API_KEY = localStorage.getItem('OWM_API_KEY') || '56de75c604b901594ccf4153b827dbd2';

                const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
                if (!response.ok) throw new Error("API Limit or configuration error");

                const data = await response.json();
                return {
                    temp: Math.round(data.main.temp),
                    feelsLike: Math.round(data.main.feels_like),
                    description: data.weather[0].description,
                    icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
                    humidity: data.main.humidity,
                    windSpeed: Math.round(data.wind.speed * 3.6),
                    source: "live"
                };
            } catch (err) {
                const randomTempOffset = Math.floor(Math.random() * 5) - 2;
                let baseTemp = 20;
                let desc = "Clear sky";
                let iconCode = "01d";
                let humidity = 60;
                let wind = 12;

                const nameLower = destinationName.toLowerCase();
                if (nameLower.includes("swiss") || nameLower.includes("banff") || nameLower.includes("reykjavik")) {
                    baseTemp = nameLower.includes("reykjavik") ? 4 : 8;
                    desc = Math.random() > 0.5 ? "Light snow" : "Cloudy";
                    iconCode = "13d";
                    humidity = 78;
                } else if (nameLower.includes("maldives") || nameLower.includes("bali") || nameLower.includes("santorini") || nameLower.includes("amalfi")) {
                    baseTemp = 28;
                    desc = Math.random() > 0.7 ? "Scattered clouds" : "Sunny";
                    iconCode = "01d";
                    humidity = 65;
                } else if (nameLower.includes("cairo") || nameLower.includes("petra")) {
                    baseTemp = 32;
                    desc = "Hot and dry";
                    iconCode = "01d";
                    humidity = 30;
                } else if (nameLower.includes("kyoto") || nameLower.includes("queenstown")) {
                    baseTemp = 16;
                    desc = "Mild breeze";
                    iconCode = "02d";
                    humidity = 55;
                }

                return {
                    temp: baseTemp + randomTempOffset,
                    feelsLike: baseTemp + randomTempOffset - 1,
                    description: desc,
                    icon: `https://openweathermap.org/img/wn/${iconCode}@2x.png`,
                    humidity: humidity,
                    windSpeed: wind,
                    source: "simulated"
                };
            }
        }
    };

    window.WanderData = WanderData;
})();
