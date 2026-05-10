from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.core.files.base import ContentFile
from places.models import City, Activity
import urllib.request

# ── Unsplash cover image URLs ─────────────────────────────────────────────────
CITY_IMAGES = {
    # International
    "Paris":       "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",
    "Tokyo":       "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
    "New York":    "https://images.unsplash.com/photo-1543716091-a840c05249ec?w=600&q=80",
    "London":      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80",
    "Dubai":       "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80",
    "Bali":        "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
    "Singapore":   "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80",
    "Bangkok":     "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80",
    # India
    "Mumbai":      "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=600&q=80",
    "Delhi":       "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80",
    "Jaipur":      "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&q=80",
    "Goa":         "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80",
    "Varanasi":    "https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=600&q=80",
    "Kochi":       "https://images.unsplash.com/photo-1590372323905-0e13bcc99a9e?w=600&q=80",
    "Udaipur":     "https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=600&q=80",
    "Agra":        "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=80",
    "Rishikesh":   "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=600&q=80",
    "Darjeeling":  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    "Amritsar":    "https://images.unsplash.com/photo-1573552040476-4a8ff7e03c3b?w=600&q=80",
    "Hampi":       "https://images.unsplash.com/photo-1600100397608-658b90a9c9e7?w=600&q=80",
}

# ── Detailed activities per city ──────────────────────────────────────────────
CITY_ACTIVITIES = {
    # ── International ──────────────────────────────────────────────────────────
    "Paris": [
        ("Eiffel Tower Visit", "sightseeing", 26, 3.0),
        ("Louvre Museum Tour", "culture", 17, 4.0),
        ("Seine River Cruise", "adventure", 15, 2.0),
        ("French Cuisine Tasting", "food", 45, 2.0),
        ("Cycling Along the Seine", "physical", 20, 3.0),
    ],
    "Tokyo": [
        ("Shibuya Crossing & Harajuku Walk", "sightseeing", 0, 3.0),
        ("Tsukiji Outer Market Breakfast", "food", 20, 2.0),
        ("TeamLab Digital Art Museum", "culture", 32, 3.0),
        ("Mount Fuji Day Trip", "adventure", 80, 8.0),
        ("Jogging in Yoyogi Park", "physical", 0, 1.0),
    ],
    "New York": [
        ("Statue of Liberty & Ellis Island", "sightseeing", 24, 4.0),
        ("Central Park Bike Ride", "physical", 15, 2.0),
        ("Broadway Show", "culture", 120, 3.0),
        ("NYC Food Tour", "food", 65, 3.0),
        ("Kayaking on Hudson River", "adventure", 40, 2.0),
    ],
    "London": [
        ("Tower of London & Crown Jewels", "culture", 30, 3.0),
        ("Borough Market Food Tour", "food", 25, 2.0),
        ("Thames Kayaking", "adventure", 55, 3.0),
        ("Changing of the Guard", "sightseeing", 0, 1.0),
        ("Hyde Park Morning Run", "physical", 0, 1.0),
    ],
    "Dubai": [
        ("Burj Khalifa At the Top", "sightseeing", 40, 2.0),
        ("Desert Safari & BBQ Dinner", "adventure", 70, 6.0),
        ("Dubai Food Tour", "food", 55, 3.0),
        ("Dubai Frame Visit", "culture", 14, 2.0),
        ("Skydiving over Palm Jumeirah", "physical", 500, 3.0),
    ],
    "Bali": [
        ("Ubud Temple & Monkey Forest", "culture", 10, 4.0),
        ("Tegallalang Rice Terraces", "sightseeing", 5, 2.0),
        ("White Water Rafting", "adventure", 35, 3.0),
        ("Balinese Cooking Class", "food", 40, 4.0),
        ("Sunrise Hike Mount Batur", "physical", 60, 6.0),
    ],
    "Singapore": [
        ("Gardens by the Bay", "sightseeing", 28, 3.0),
        ("Hawker Centre Food Crawl", "food", 15, 2.0),
        ("Universal Studios Singapore", "adventure", 80, 6.0),
        ("National Museum of Singapore", "culture", 15, 3.0),
        ("Sentosa Island Cycling", "physical", 20, 2.0),
    ],
    "Bangkok": [
        ("Grand Palace & Wat Pho", "sightseeing", 15, 4.0),
        ("Floating Market Tour", "culture", 25, 4.0),
        ("Street Food Night Tour", "food", 20, 3.0),
        ("Muay Thai Class", "physical", 30, 2.0),
        ("Chao Phraya River Boat Trip", "adventure", 10, 2.0),
    ],

    # ── India ─────────────────────────────────────────────────────────────────
    "Mumbai": [
        ("Gateway of India & Boat to Elephanta Caves", "sightseeing", 400, 4.0),
        ("Dharavi Street Food Walk", "food", 200, 3.0),
        ("Bollywood Studio Tour", "culture", 1500, 3.0),
        ("Marine Drive Sunset Walk", "physical", 0, 1.5),
        ("Mumbai by Night Cycling Tour", "adventure", 700, 3.0),
    ],
    "Delhi": [
        ("Red Fort & Chandni Chowk Walk", "sightseeing", 35, 4.0),
        ("Qutub Minar & Humayun's Tomb", "culture", 300, 3.0),
        ("Old Delhi Street Food Safari", "food", 350, 3.0),
        ("Rickshaw Ride through Paharganj", "adventure", 150, 2.0),
        ("Lodhi Garden Morning Jog", "physical", 0, 1.5),
    ],
    "Jaipur": [
        ("Amber Fort & Elephant Ride", "sightseeing", 500, 4.0),
        ("Hawa Mahal & City Palace Tour", "culture", 200, 3.0),
        ("Rajasthani Thali Experience", "food", 300, 1.5),
        ("Cycle Ride through the Pink City", "physical", 150, 2.0),
        ("Hot Air Balloon over Jaipur", "adventure", 8000, 1.5),
    ],
    "Goa": [
        ("Baga & Calangute Beach Day", "physical", 0, 4.0),
        ("Old Goa Portuguese Churches Tour", "culture", 0, 3.0),
        ("Spice Plantation Visit & Lunch", "food", 600, 3.0),
        ("Scuba Diving at Grande Island", "adventure", 2500, 3.0),
        ("Dudhsagar Waterfall Trek", "adventure", 1200, 6.0),
    ],
    "Varanasi": [
        ("Ganga Aarti at Dashashwamedh Ghat", "culture", 0, 2.0),
        ("Sunrise Boat Ride on the Ganges", "sightseeing", 300, 2.0),
        ("Sarnath Buddhist Site Tour", "culture", 100, 3.0),
        ("Kashi Vishwanath Temple Visit", "culture", 0, 1.5),
        ("Varanasi Street Food Walk", "food", 200, 2.5),
    ],
    "Kochi": [
        ("Chinese Fishing Nets & Fort Kochi Walk", "sightseeing", 0, 3.0),
        ("Kerala Backwater Houseboat Cruise", "adventure", 3000, 8.0),
        ("Kathakali Dance Performance", "culture", 350, 2.0),
        ("Kerala Sadya Feast", "food", 400, 1.5),
        ("Alleppey Kayaking in Backwaters", "physical", 800, 3.0),
    ],
    "Udaipur": [
        ("City Palace & Lake Pichola Boat Ride", "sightseeing", 300, 3.0),
        ("Jag Mandir Island Visit", "culture", 200, 2.0),
        ("Rajasthani Village Safari", "adventure", 1200, 4.0),
        ("Rooftop Dinner with Lake View", "food", 800, 2.0),
        ("Sunrise Trek to Karni Mata Hill", "physical", 0, 2.0),
    ],
    "Agra": [
        ("Taj Mahal Sunrise Visit", "sightseeing", 1100, 3.0),
        ("Agra Fort Tour", "culture", 550, 2.5),
        ("Fatehpur Sikri Day Trip", "sightseeing", 610, 4.0),
        ("Petha & Mughlai Food Walk", "food", 300, 2.0),
        ("Taj Mahal by Moonlight", "culture", 750, 2.0),
    ],
    "Rishikesh": [
        ("White Water Rafting on the Ganges", "adventure", 600, 3.0),
        ("Bungee Jumping at Jumpin Heights", "adventure", 3550, 2.0),
        ("Yoga & Meditation Session", "physical", 500, 2.0),
        ("Laxman Jhula & Ram Jhula Walk", "sightseeing", 0, 2.0),
        ("Satvik Ashram Meal", "food", 200, 1.0),
    ],
    "Darjeeling": [
        ("Tiger Hill Sunrise & Kanchenjunga View", "sightseeing", 200, 4.0),
        ("Toy Train Ride (Darjeeling Himalayan Railway)", "adventure", 250, 2.0),
        ("Tea Estate Tour & Tasting", "culture", 300, 2.0),
        ("Batasia Loop & War Memorial", "sightseeing", 50, 1.5),
        ("Trek to Sandakphu", "physical", 1500, 8.0),
    ],
    "Amritsar": [
        ("Golden Temple Visit & Langar Meal", "culture", 0, 3.0),
        ("Wagah Border Beating Retreat Ceremony", "culture", 0, 3.0),
        ("Jallianwala Bagh Memorial", "sightseeing", 0, 1.5),
        ("Amritsari Kulcha & Lassi Trail", "food", 200, 2.0),
        ("Partition Museum Tour", "culture", 200, 2.0),
    ],
    "Hampi": [
        ("Virupaksha Temple & Bazaar Walk", "culture", 0, 3.0),
        ("Vittala Temple & Stone Chariot", "sightseeing", 600, 3.0),
        ("Coracle Ride on Tungabhadra River", "adventure", 300, 1.5),
        ("Hampi Ruins Sunrise Cycle", "physical", 200, 3.0),
        ("Local Dosa & Filter Coffee Breakfast", "food", 100, 1.0),
    ],
}

# ── City metadata (name, country, region, cost_index, popularity, description) ─
CITIES_META = [
    # International (8)
    ("Paris",     "France",     "Europe",      2.5, 98,
     "The City of Light — home to the Eiffel Tower, world-class cuisine, and timeless art."),
    ("Tokyo",     "Japan",      "Asia",         2.2, 97,
     "A neon-lit metropolis blending ancient temples with cutting-edge pop culture."),
    ("New York",  "USA",        "Americas",     2.8, 96,
     "The city that never sleeps — Broadway, Central Park, and iconic skylines."),
    ("London",    "UK",         "Europe",       2.9, 95,
     "Royal history, red buses, riverside pubs, and a buzzing multicultural food scene."),
    ("Dubai",     "UAE",        "Middle East",  2.6, 91,
     "Ultramodern skyscrapers, golden deserts, and luxury experiences in the Gulf."),
    ("Bali",      "Indonesia",  "Asia",         1.1, 91,
     "Island of the Gods — lush rice terraces, spiritual temples, and surf beaches."),
    ("Singapore", "Singapore",  "Asia",         2.4, 88,
     "A clean, green city-state where hawker food meets world-class attractions."),
    ("Bangkok",   "Thailand",   "Asia",         1.2, 92,
     "Street food paradise, gilded temples, and electric nightlife on the Chao Phraya."),
    # India (12)
    ("Mumbai",    "India",      "India",        1.2, 90,
     "India's financial capital — Bollywood glamour, colonial architecture, and iconic street food."),
    ("Delhi",     "India",      "India",        1.0, 89,
     "A layered city where Mughal monuments meet a thriving modern urban culture."),
    ("Jaipur",    "India",      "India",        0.9, 88,
     "The Pink City of Rajasthan — forts, palaces, and a riot of colour and craft."),
    ("Goa",       "India",      "India",        1.1, 92,
     "Sun-kissed beaches, Portuguese churches, seafood shacks, and vibrant nightlife."),
    ("Varanasi",  "India",      "India",        0.7, 87,
     "The spiritual capital of India, where the Ganges carries a thousand years of ritual."),
    ("Kochi",     "India",      "India",        0.9, 86,
     "Gateway to Kerala — backwaters, Chinese fishing nets, and spice-laden cuisine."),
    ("Udaipur",   "India",      "India",        0.9, 88,
     "The City of Lakes — romantic palaces rising from shimmering blue-green waters."),
    ("Agra",      "India",      "India",        0.8, 93,
     "Home to the Taj Mahal, a UNESCO masterpiece and symbol of eternal love."),
    ("Rishikesh", "India",      "India",        0.7, 85,
     "The Yoga Capital of the World — riverside ashrams, white-water rafting, and Himalayan air."),
    ("Darjeeling","India",      "India",        0.8, 84,
     "Tea gardens, toy trains, and panoramic Himalayan views from the clouds."),
    ("Amritsar",  "India",      "India",        0.7, 86,
     "Home of the Golden Temple and the soul of Punjab — devotion, history, and hearty food."),
    ("Hampi",     "India",      "India",        0.6, 82,
     "A UNESCO World Heritage landscape of boulder-strewn ruins and Vijayanagara glory."),
]


class Command(BaseCommand):
    help = 'Seeds database with cities (international + Indian) and their activities & images'

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true',
                            help='Delete all existing cities before re-seeding')

    def download_image(self, url, filename):
        try:
            req = urllib.request.Request(
                url, headers={'User-Agent': 'Mozilla/5.0 (Traveloop/1.0)'}
            )
            with urllib.request.urlopen(req, timeout=15) as r:
                return ContentFile(r.read(), name=filename)
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'    Could not download {filename}: {e}'))
            return None

    def handle(self, *args, **kwargs):
        # ── Admin user ──────────────────────────────────────────────────────
        if not User.objects.filter(username='admin@traveloop.com').exists():
            User.objects.create_superuser(
                'admin@traveloop.com', 'admin@traveloop.com', 'admin123'
            )
            self.stdout.write(self.style.SUCCESS('Admin user created.'))
        else:
            self.stdout.write(self.style.WARNING('Admin already exists.'))

        # ── Reset ───────────────────────────────────────────────────────────
        if kwargs.get('reset'):
            City.objects.all().delete()
            self.stdout.write(self.style.WARNING('All cities deleted. Re-seeding...'))
        elif City.objects.exists():
            self.stdout.write(self.style.WARNING(
                'Cities already exist. Run with --reset to re-seed.'
            ))
            return

        # ── Seed ────────────────────────────────────────────────────────────
        self.stdout.write('\nSeeding cities...\n')
        for (c_name, c_country, c_region, c_cost, c_pop, c_desc) in CITIES_META:
            city = City(
                name=c_name, country=c_country, region=c_region,
                cost_index=c_cost, popularity=c_pop, description=c_desc,
            )

            img_url = CITY_IMAGES.get(c_name)
            if img_url:
                self.stdout.write(f'  Downloading image for {c_name}...')
                safe = c_name.lower().replace(' ', '_')
                img = self.download_image(img_url, f'{safe}.jpg')
                if img:
                    city.cover_image.save(f'{safe}.jpg', img, save=False)

            city.save()

            acts = CITY_ACTIVITIES.get(c_name, [])
            for act_name, act_type, act_cost, act_duration in acts:
                Activity.objects.create(
                    city=city,
                    name=act_name,
                    type=act_type,
                    cost=float(act_cost),
                    duration_hours=act_duration,
                    description=f"{act_name} — a must-do experience in {c_name}.",
                )

            tag = "India" if c_country == "India" else c_country
            self.stdout.write(
                self.style.SUCCESS(f'  [OK] {c_name}, {tag} — {len(acts)} activities')
            )

        self.stdout.write(self.style.SUCCESS(
            f'\nDone. {len(CITIES_META)} cities seeded ({sum(1 for c in CITIES_META if c[1]=="India")} Indian, '
            f'{sum(1 for c in CITIES_META if c[1]!="India")} international).'
        ))
