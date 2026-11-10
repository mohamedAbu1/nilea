"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type LocaleCode = "en" | "ar" | "es" | "fr" | "it" | "zh" | "de" | "pl" | "cs";

export const localeOptions: { code: LocaleCode; native: string }[] = [
  { code: "en", native: "English" },
  { code: "ar", native: "العربية" },
  { code: "es", native: "Español" },
  { code: "fr", native: "Français" },
  { code: "it", native: "Italiano" },
  { code: "zh", native: "中文" },
  { code: "de", native: "Deutsch" },
  { code: "pl", native: "Polski" },
  { code: "cs", native: "Čeština" },
];

type TranslationMap = Record<string, string>;

const translations: Record<Exclude<LocaleCode, "en">, TranslationMap> = {
  ar: {
    Explore: "استكشف", Destinations: "الوجهات", History: "التاريخ", "Local Life & Dining": "الحياة المحلية والمطاعم", "Stays & Hotels": "الإقامات والفنادق", "Tours & Experiences": "الرحلات والتجارب", "Smart Guide": "الدليل الذكي", "Plan Your Trip": "خطط لرحلتك", "Search AlpNile": "ابحث في AlpNile", "Back to top": "العودة للأعلى", TOP: "أعلى", "Same river. A thousand stories.": "النهر نفسه. ألف حكاية.", "Local Life": "الحياة المحلية", Stays: "الإقامات", Experiences: "التجارب", Language: "اللغة", Journey: "الرحلة", "Through Time": "عبر الزمن", "Five eras. A timeless civilization.": "خمسة عصور. حضارة خالدة.", "Same River": "النهر نفسه", "A Thousand Stories": "ألف حكاية", "05 chapters": "05 فصول", "Key dates": "تواريخ مهمة", "Listen to the story": "استمع إلى الحكاية", "Explore artifacts": "استكشف القطع الأثرية", "View all": "عرض الكل", "Smart Trip Planner": "مخطط الرحلات الذكي", "Your journey, intelligently arranged": "رحلتك مرتبة بذكاء", "Travel Dates": "تواريخ السفر", "Travel Style": "أسلوب السفر", Culture: "ثقافة", Adventure: "مغامرة", Luxury: "فخامة", Family: "عائلة", Budget: "الميزانية", "per person": "للفرد", "Suggested itinerary": "البرنامج المقترح", "Nile Route": "مسار النيل", "AI Recommendations": "اقتراحات ذكية", "Build My Journey": "أنشئ رحلتي", "Save Itinerary": "حفظ البرنامج", "Share Trip": "مشاركة الرحلة", "Add Experience": "إضافة تجربة", "Featured Destinations": "وجهات مميزة", "Explore destinations": "استكشف الوجهات", "Featured Experiences": "تجارب مميزة", "Recommended for You": "مقترح لك", "Search Experiences": "ابحث عن التجارب", "Make the moment memorable": "اجعل اللحظة لا تُنسى", "Near You": "بالقرب منك", "Find your stay": "اعثر على إقامتك"
  },
  es: {
    Explore: "Explorar", Destinations: "Destinos", History: "Historia", "Local Life & Dining": "Vida local y gastronomía", "Stays & Hotels": "Estancias y hoteles", "Tours & Experiences": "Tours y experiencias", "Smart Guide": "Guía inteligente", "Plan Your Trip": "Planifica tu viaje", "Search AlpNile": "Buscar en AlpNile", "Back to top": "Volver arriba", TOP: "ARRIBA", "Same river. A thousand stories.": "El mismo río. Mil historias.", "Local Life": "Vida local", Stays: "Estancias", Experiences: "Experiencias", Language: "Idioma", Journey: "Viaje", "Through Time": "A través del tiempo", "Five eras. A timeless civilization.": "Cinco eras. Una civilización eterna.", "Same River": "El mismo río", "A Thousand Stories": "Mil historias", "05 chapters": "05 capítulos", "Key dates": "Fechas clave", "Listen to the story": "Escucha la historia", "Explore artifacts": "Explorar artefactos", "View all": "Ver todo", "Smart Trip Planner": "Planificador inteligente", "Your journey, intelligently arranged": "Tu viaje, organizado de forma inteligente", "Travel Dates": "Fechas del viaje", "Travel Style": "Estilo de viaje", Culture: "Cultura", Adventure: "Aventura", Luxury: "Lujo", Family: "Familia", Budget: "Presupuesto", "per person": "por persona", "Suggested itinerary": "Itinerario sugerido", "Nile Route": "Ruta del Nilo", "AI Recommendations": "Recomendaciones de IA", "Build My Journey": "Crear mi viaje", "Save Itinerary": "Guardar itinerario", "Share Trip": "Compartir viaje", "Add Experience": "Añadir experiencia", "Featured Destinations": "Destinos destacados", "Explore destinations": "Explorar destinos", "Featured Experiences": "Experiencias destacadas", "Recommended for You": "Recomendado para ti", "Search Experiences": "Buscar experiencias", "Make the moment memorable": "Haz memorable cada momento", "Near You": "Cerca de ti", "Find your stay": "Encuentra tu alojamiento", "Listen up, this is Egypt · YouTube ↗": "Escucha, esto es Egipto · YouTube ↗", "Now playing · YouTube": "Reproduciendo · YouTube"
  },
  fr: {
    Explore: "Explorer", Destinations: "Destinations", History: "Histoire", "Local Life & Dining": "Vie locale & gastronomie", "Stays & Hotels": "Séjours & hôtels", "Tours & Experiences": "Circuits & expériences", "Smart Guide": "Guide intelligent", "Plan Your Trip": "Planifier votre voyage", "Search AlpNile": "Rechercher sur AlpNile", "Back to top": "Retour en haut", TOP: "HAUT", "Same river. A thousand stories.": "Le même fleuve. Mille histoires.", "Local Life": "Vie locale", Stays: "Séjours", Experiences: "Expériences", Language: "Langue", Journey: "Voyage", "Through Time": "À travers le temps", "Five eras. A timeless civilization.": "Cinq époques. Une civilisation éternelle.", "Same River": "Le même fleuve", "A Thousand Stories": "Mille histoires", "05 chapters": "05 chapitres", "Key dates": "Dates clés", "Listen to the story": "Écouter l'histoire", "Explore artifacts": "Explorer les artefacts", "View all": "Tout voir", "Smart Trip Planner": "Planificateur de voyage intelligent", "Your journey, intelligently arranged": "Votre voyage, organisé intelligemment", "Travel Dates": "Dates du voyage", "Travel Style": "Style de voyage", Culture: "Culture", Adventure: "Aventure", Luxury: "Luxe", Family: "Famille", Budget: "Budget", "per person": "par personne", "Suggested itinerary": "Itinéraire suggéré", "Nile Route": "Route du Nil", "AI Recommendations": "Recommandations IA", "Build My Journey": "Créer mon voyage", "Save Itinerary": "Enregistrer l'itinéraire", "Share Trip": "Partager le voyage", "Add Experience": "Ajouter une expérience", "Featured Destinations": "Destinations à la une", "Explore destinations": "Explorer les destinations", "Featured Experiences": "Expériences à la une", "Recommended for You": "Recommandé pour vous", "Search Experiences": "Rechercher des expériences", "Make the moment memorable": "Rendez le moment inoubliable", "Near You": "Près de vous", "Find your stay": "Trouvez votre hébergement", "Listen up, this is Egypt · YouTube ↗": "Écoutez, voici l'Égypte · YouTube ↗", "Now playing · YouTube": "Lecture · YouTube"
  },
  it: {
    Explore: "Esplora", Destinations: "Destinazioni", History: "Storia", "Local Life & Dining": "Vita locale e cucina", "Stays & Hotels": "Soggiorni e hotel", "Tours & Experiences": "Tour ed esperienze", "Smart Guide": "Guida intelligente", "Plan Your Trip": "Pianifica il viaggio", "Search AlpNile": "Cerca su AlpNile", "Back to top": "Torna su", TOP: "SU", "Same river. A thousand stories.": "Lo stesso fiume. Mille storie.", "Local Life": "Vita locale", Stays: "Soggiorni", Experiences: "Esperienze", Language: "Lingua", Journey: "Viaggio", "Through Time": "Attraverso il tempo", "Five eras. A timeless civilization.": "Cinque epoche. Una civiltà senza tempo.", "Same River": "Lo stesso fiume", "A Thousand Stories": "Mille storie", "05 chapters": "05 capitoli", "Key dates": "Date chiave", "Listen to the story": "Ascolta la storia", "Explore artifacts": "Esplora i reperti", "View all": "Vedi tutto", "Smart Trip Planner": "Pianificatore di viaggio intelligente", "Your journey, intelligently arranged": "Il tuo viaggio, organizzato con intelligenza", "Travel Dates": "Date del viaggio", "Travel Style": "Stile di viaggio", Culture: "Cultura", Adventure: "Avventura", Luxury: "Lusso", Family: "Famiglia", Budget: "Budget", "per person": "a persona", "Suggested itinerary": "Itinerario suggerito", "Nile Route": "Itinerario del Nilo", "AI Recommendations": "Consigli IA", "Build My Journey": "Crea il mio viaggio", "Save Itinerary": "Salva itinerario", "Share Trip": "Condividi viaggio", "Add Experience": "Aggiungi esperienza", "Featured Destinations": "Destinazioni in evidenza", "Explore destinations": "Esplora le destinazioni", "Featured Experiences": "Esperienze in evidenza", "Recommended for You": "Consigliato per te", "Search Experiences": "Cerca esperienze", "Make the moment memorable": "Rendi memorabile il momento", "Near You": "Vicino a te", "Find your stay": "Trova il tuo soggiorno", "Listen up, this is Egypt · YouTube ↗": "Ascolta, questa è l'Egitto · YouTube ↗", "Now playing · YouTube": "In riproduzione · YouTube"
  },
  zh: {
    Explore: "探索", Destinations: "目的地", History: "历史", "Local Life & Dining": "当地生活与美食", "Stays & Hotels": "住宿与酒店", "Tours & Experiences": "旅行与体验", "Smart Guide": "智能指南", "Plan Your Trip": "规划旅程", "Search AlpNile": "搜索 AlpNile", "Back to top": "返回顶部", TOP: "顶部", "Same river. A thousand stories.": "同一条河流，千个故事。", "Local Life": "当地生活", Stays: "住宿", Experiences: "体验", Language: "语言", Journey: "旅程", "Through Time": "穿越时光", "Five eras. A timeless civilization.": "五个时代，一座永恒的文明。", "Same River": "同一条河流", "A Thousand Stories": "千个故事", "05 chapters": "05 个篇章", "Key dates": "重要年代", "Listen to the story": "聆听故事", "Explore artifacts": "探索文物", "View all": "查看全部", "Smart Trip Planner": "智能旅行规划", "Your journey, intelligently arranged": "智能安排您的旅程", "Travel Dates": "旅行日期", "Travel Style": "旅行风格", Culture: "文化", Adventure: "探险", Luxury: "奢华", Family: "家庭", Budget: "预算", "per person": "每人", "Suggested itinerary": "推荐行程", "Nile Route": "尼罗河路线", "AI Recommendations": "AI 推荐", "Build My Journey": "创建我的旅程", "Save Itinerary": "保存行程", "Share Trip": "分享旅程", "Add Experience": "添加体验", "Featured Destinations": "精选目的地", "Explore destinations": "探索目的地", "Featured Experiences": "精选体验", "Recommended for You": "为你推荐", "Search Experiences": "搜索体验", "Make the moment memorable": "让这一刻难忘", "Near You": "附近推荐", "Find your stay": "寻找住宿", "Listen up, this is Egypt · YouTube ↗": "听，这就是埃及 · YouTube ↗", "Now playing · YouTube": "正在播放 · YouTube"
  },
  de: {
    Explore: "Entdecken", Destinations: "Reiseziele", History: "Geschichte", "Local Life & Dining": "Lokales Leben & Kulinarik", "Stays & Hotels": "Unterkünfte & Hotels", "Tours & Experiences": "Touren & Erlebnisse", "Smart Guide": "Intelligenter Guide", "Plan Your Trip": "Reise planen", "Search AlpNile": "AlpNile durchsuchen", "Back to top": "Nach oben", TOP: "OBEN", "Same river. A thousand stories.": "Derselbe Fluss. Tausend Geschichten.", "Local Life": "Lokales Leben", Stays: "Unterkünfte", Experiences: "Erlebnisse", Language: "Sprache", Journey: "Reise", "Through Time": "Durch die Zeit", "Five eras. A timeless civilization.": "Fünf Epochen. Eine zeitlose Zivilisation.", "Same River": "Derselbe Fluss", "A Thousand Stories": "Tausend Geschichten", "05 chapters": "05 Kapitel", "Key dates": "Wichtige Daten", "Listen to the story": "Geschichte anhören", "Explore artifacts": "Artefakte entdecken", "View all": "Alle ansehen", "Smart Trip Planner": "Intelligenter Reiseplaner", "Your journey, intelligently arranged": "Ihre Reise intelligent geplant", "Travel Dates": "Reisedaten", "Travel Style": "Reisestil", Culture: "Kultur", Adventure: "Abenteuer", Luxury: "Luxus", Family: "Familie", Budget: "Budget", "per person": "pro Person", "Suggested itinerary": "Vorgeschlagene Reiseroute", "Nile Route": "Nil-Route", "AI Recommendations": "KI-Empfehlungen", "Build My Journey": "Meine Reise erstellen", "Save Itinerary": "Reiseplan speichern", "Share Trip": "Reise teilen", "Add Experience": "Erlebnis hinzufügen", "Featured Destinations": "Besondere Reiseziele", "Explore destinations": "Reiseziele entdecken", "Featured Experiences": "Besondere Erlebnisse", "Recommended for You": "Für Sie empfohlen", "Search Experiences": "Erlebnisse suchen", "Make the moment memorable": "Machen Sie den Moment unvergesslich", "Near You": "In Ihrer Nähe", "Find your stay": "Unterkunft finden", "Listen up, this is Egypt · YouTube ↗": "Hören Sie, das ist Ägypten · YouTube ↗", "Now playing · YouTube": "Wiedergabe · YouTube"
  },
  pl: {
    Explore: "Odkrywaj", Destinations: "Miejsca docelowe", History: "Historia", "Local Life & Dining": "Lokalne życie i kuchnia", "Stays & Hotels": "Noclegi i hotele", "Tours & Experiences": "Wycieczki i doświadczenia", "Smart Guide": "Inteligentny przewodnik", "Plan Your Trip": "Zaplanuj podróż", "Search AlpNile": "Szukaj w AlpNile", "Back to top": "Wróć na górę", TOP: "GÓRA", "Same river. A thousand stories.": "Ta sama rzeka. Tysiące historii.", "Local Life": "Lokalne życie", Stays: "Noclegi", Experiences: "Doświadczenia", Language: "Język", Journey: "Podróż", "Through Time": "Przez czas", "Five eras. A timeless civilization.": "Pięć epok. Ponadczasowa cywilizacja.", "Same River": "Ta sama rzeka", "A Thousand Stories": "Tysiące historii", "05 chapters": "05 rozdziałów", "Key dates": "Najważniejsze daty", "Listen to the story": "Posłuchaj historii", "Explore artifacts": "Odkrywaj artefakty", "View all": "Zobacz wszystko", "Smart Trip Planner": "Inteligentny planer podróży", "Your journey, intelligently arranged": "Twoja podróż inteligentnie zaplanowana", "Travel Dates": "Daty podróży", "Travel Style": "Styl podróży", Culture: "Kultura", Adventure: "Przygoda", Luxury: "Luksus", Family: "Rodzina", Budget: "Budżet", "per person": "za osobę", "Suggested itinerary": "Sugerowany plan podróży", "Nile Route": "Szlak Nilu", "AI Recommendations": "Rekomendacje AI", "Build My Journey": "Zbuduj moją podróż", "Save Itinerary": "Zapisz plan", "Share Trip": "Udostępnij podróż", "Add Experience": "Dodaj doświadczenie", "Featured Destinations": "Polecane miejsca", "Explore destinations": "Odkrywaj miejsca", "Featured Experiences": "Polecane doświadczenia", "Recommended for You": "Polecane dla Ciebie", "Search Experiences": "Szukaj doświadczeń", "Make the moment memorable": "Uczyń tę chwilę niezapomnianą", "Near You": "W pobliżu", "Find your stay": "Znajdź nocleg", "Listen up, this is Egypt · YouTube ↗": "Posłuchaj, to jest Egipt · YouTube ↗", "Now playing · YouTube": "Odtwarzanie · YouTube"
  },
  cs: {
    Explore: "Prozkoumat", Destinations: "Destinace", History: "Historie", "Local Life & Dining": "Místní život a gastronomie", "Stays & Hotels": "Ubytování a hotely", "Tours & Experiences": "Prohlídky a zážitky", "Smart Guide": "Chytrý průvodce", "Plan Your Trip": "Naplánovat cestu", "Search AlpNile": "Hledat v AlpNile", "Back to top": "Zpět nahoru", TOP: "NAHORU", "Same river. A thousand stories.": "Stejná řeka. Tisíce příběhů.", "Local Life": "Místní život", Stays: "Ubytování", Experiences: "Zážitky", Language: "Jazyk", Journey: "Cesta", "Through Time": "Napříč časem", "Five eras. A timeless civilization.": "Pět epoch. Nadčasová civilizace.", "Same River": "Stejná řeka", "A Thousand Stories": "Tisíce příběhů", "05 chapters": "05 kapitol", "Key dates": "Klíčová data", "Listen to the story": "Poslechnout příběh", "Explore artifacts": "Prozkoumat artefakty", "View all": "Zobrazit vše", "Smart Trip Planner": "Chytrý plánovač cest", "Your journey, intelligently arranged": "Vaše cesta inteligentně naplánovaná", "Travel Dates": "Termíny cesty", "Travel Style": "Styl cestování", Culture: "Kultura", Adventure: "Dobrodružství", Luxury: "Luxus", Family: "Rodina", Budget: "Rozpočet", "per person": "na osobu", "Suggested itinerary": "Navržený itinerář", "Nile Route": "Trasa Nilu", "AI Recommendations": "Doporučení AI", "Build My Journey": "Vytvořit mou cestu", "Save Itinerary": "Uložit itinerář", "Share Trip": "Sdílet cestu", "Add Experience": "Přidat zážitek", "Featured Destinations": "Doporučené destinace", "Explore destinations": "Prozkoumat destinace", "Featured Experiences": "Doporučené zážitky", "Recommended for You": "Doporučeno pro vás", "Search Experiences": "Hledat zážitky", "Make the moment memorable": "Udělejte okamžik nezapomenutelným", "Near You": "Ve vašem okolí", "Find your stay": "Najděte ubytování", "Listen up, this is Egypt · YouTube ↗": "Poslouchejte, tohle je Egypt · YouTube ↗", "Now playing · YouTube": "Přehrávání · YouTube"
  },
};

const commonTranslations: Record<Exclude<LocaleCode, "en">, TranslationMap> = {
  ar: { Welcome: "مرحبًا", "Primary navigation": "التنقل الرئيسي", "Mobile navigation": "تنقل الهاتف", "Open menu": "فتح القائمة", "Close menu": "إغلاق القائمة", "Search destinations, stays or experiences": "ابحث عن وجهات أو إقامات أو تجارب", "No results found": "لم يتم العثور على نتائج", "Footer navigation": "تنقل التذييل", "List View": "عرض القائمة", "3D Map": "خريطة ثلاثية الأبعاد", "View Story": "عرض الحكاية", "Plan Route": "خطط للمسار", "Book Tickets": "احجز التذاكر", "Find a Stay": "اعثر على إقامة", "Save this place": "حفظ هذا المكان", Saved: "تم الحفظ", "Continue to request": "متابعة الطلب", "Booking request ready": "طلب الحجز جاهز", "Reservation request ready": "طلب الإقامة جاهز", "No experiences found": "لم يتم العثور على تجارب", "No stays found": "لم يتم العثور على إقامات", "Playing on YouTube": "يعمل على YouTube", "Play original track": "تشغيل المقطع الأصلي", "Start planning": "ابدأ التخطيط", Destinations: "الوجهات", "Local Life": "الحياة المحلية", "Stays & Hotels": "الإقامات والفنادق", "Tours & Experiences": "الرحلات والتجارب", "Smart Guide": "الدليل الذكي" },
  es: { Welcome: "Bienvenido", "Primary navigation": "Navegación principal", "Mobile navigation": "Navegación móvil", "Open menu": "Abrir menú", "Close menu": "Cerrar menú", "Search destinations, stays or experiences": "Buscar destinos, alojamientos o experiencias", "No results found": "No se encontraron resultados", "Footer navigation": "Navegación del pie", "List View": "Vista de lista", "3D Map": "Mapa 3D", "View Story": "Ver historia", "Plan Route": "Planificar ruta", "Book Tickets": "Reservar entradas", "Find a Stay": "Encontrar alojamiento", "Save this place": "Guardar este lugar", Saved: "Guardado", "Continue to request": "Continuar con la solicitud", "Booking request ready": "Solicitud de reserva lista", "Reservation request ready": "Solicitud de alojamiento lista", "No experiences found": "No se encontraron experiencias", "No stays found": "No se encontraron alojamientos", "Playing on YouTube": "Reproduciendo en YouTube", "Play original track": "Reproducir pista original", "Start planning": "Comenzar a planificar", Destinations: "Destinos", "Local Life": "Vida local", "Stays & Hotels": "Alojamientos y hoteles", "Tours & Experiences": "Tours y experiencias", "Smart Guide": "Guía inteligente" },
  fr: { Welcome: "Bienvenue", "Primary navigation": "Navigation principale", "Mobile navigation": "Navigation mobile", "Open menu": "Ouvrir le menu", "Close menu": "Fermer le menu", "Search destinations, stays or experiences": "Rechercher des destinations, séjours ou expériences", "No results found": "Aucun résultat", "Footer navigation": "Navigation du pied de page", "List View": "Vue liste", "3D Map": "Carte 3D", "View Story": "Voir l'histoire", "Plan Route": "Planifier l'itinéraire", "Book Tickets": "Réserver des billets", "Find a Stay": "Trouver un hébergement", "Save this place": "Enregistrer ce lieu", Saved: "Enregistré", "Continue to request": "Continuer la demande", "Booking request ready": "Demande de réservation prête", "Reservation request ready": "Demande d'hébergement prête", "No experiences found": "Aucune expérience trouvée", "No stays found": "Aucun hébergement trouvé", "Playing on YouTube": "Lecture sur YouTube", "Play original track": "Lire la piste originale", "Start planning": "Commencer à planifier", Destinations: "Destinations", "Local Life": "Vie locale", "Stays & Hotels": "Séjours et hôtels", "Tours & Experiences": "Circuits et expériences", "Smart Guide": "Guide intelligent" },
  it: { Welcome: "Benvenuto", "Primary navigation": "Navigazione principale", "Mobile navigation": "Navigazione mobile", "Open menu": "Apri menu", "Close menu": "Chiudi menu", "Search destinations, stays or experiences": "Cerca destinazioni, soggiorni o esperienze", "No results found": "Nessun risultato", "Footer navigation": "Navigazione del piè di pagina", "List View": "Vista elenco", "3D Map": "Mappa 3D", "View Story": "Vedi la storia", "Plan Route": "Pianifica il percorso", "Book Tickets": "Prenota biglietti", "Find a Stay": "Trova un soggiorno", "Save this place": "Salva questo luogo", Saved: "Salvato", "Continue to request": "Continua la richiesta", "Booking request ready": "Richiesta di prenotazione pronta", "Reservation request ready": "Richiesta di soggiorno pronta", "No experiences found": "Nessuna esperienza trovata", "No stays found": "Nessun soggiorno trovato", "Playing on YouTube": "In riproduzione su YouTube", "Play original track": "Riproduci traccia originale", "Start planning": "Inizia a pianificare", Destinations: "Destinazioni", "Local Life": "Vita locale", "Stays & Hotels": "Soggiorni e hotel", "Tours & Experiences": "Tour ed esperienze", "Smart Guide": "Guida intelligente" },
  zh: { Welcome: "欢迎", "Primary navigation": "主导航", "Mobile navigation": "移动导航", "Open menu": "打开菜单", "Close menu": "关闭菜单", "Search destinations, stays or experiences": "搜索目的地、住宿或体验", "No results found": "未找到结果", "Footer navigation": "页脚导航", "List View": "列表视图", "3D Map": "3D 地图", "View Story": "查看故事", "Plan Route": "规划路线", "Book Tickets": "预订门票", "Find a Stay": "寻找住宿", "Save this place": "保存此地", Saved: "已保存", "Continue to request": "继续申请", "Booking request ready": "预订申请已准备好", "Reservation request ready": "住宿申请已准备好", "No experiences found": "未找到体验", "No stays found": "未找到住宿", "Playing on YouTube": "正在 YouTube 播放", "Play original track": "播放原曲", "Start planning": "开始规划", Destinations: "目的地", "Local Life": "当地生活", "Stays & Hotels": "住宿与酒店", "Tours & Experiences": "旅行与体验", "Smart Guide": "智能指南" },
  de: { Welcome: "Willkommen", "Primary navigation": "Hauptnavigation", "Mobile navigation": "Mobile Navigation", "Open menu": "Menü öffnen", "Close menu": "Menü schließen", "Search destinations, stays or experiences": "Reiseziele, Unterkünfte oder Erlebnisse suchen", "No results found": "Keine Ergebnisse", "Footer navigation": "Footer-Navigation", "List View": "Listenansicht", "3D Map": "3D-Karte", "View Story": "Geschichte ansehen", "Plan Route": "Route planen", "Book Tickets": "Tickets buchen", "Find a Stay": "Unterkunft finden", "Save this place": "Diesen Ort speichern", Saved: "Gespeichert", "Continue to request": "Anfrage fortsetzen", "Booking request ready": "Buchungsanfrage bereit", "Reservation request ready": "Unterkunftsanfrage bereit", "No experiences found": "Keine Erlebnisse gefunden", "No stays found": "Keine Unterkünfte gefunden", "Playing on YouTube": "Wiedergabe auf YouTube", "Play original track": "Originaltitel abspielen", "Start planning": "Planung beginnen", Destinations: "Reiseziele", "Local Life": "Lokales Leben", "Stays & Hotels": "Unterkünfte & Hotels", "Tours & Experiences": "Touren & Erlebnisse", "Smart Guide": "Intelligenter Guide" },
  pl: { Welcome: "Witamy", "Primary navigation": "Nawigacja główna", "Mobile navigation": "Nawigacja mobilna", "Open menu": "Otwórz menu", "Close menu": "Zamknij menu", "Search destinations, stays or experiences": "Szukaj miejsc, noclegów lub doświadczeń", "No results found": "Brak wyników", "Footer navigation": "Nawigacja stopki", "List View": "Widok listy", "3D Map": "Mapa 3D", "View Story": "Zobacz historię", "Plan Route": "Zaplanuj trasę", "Book Tickets": "Zarezerwuj bilety", "Find a Stay": "Znajdź nocleg", "Save this place": "Zapisz to miejsce", Saved: "Zapisano", "Continue to request": "Kontynuuj zapytanie", "Booking request ready": "Zapytanie gotowe", "Reservation request ready": "Zapytanie o nocleg gotowe", "No experiences found": "Nie znaleziono doświadczeń", "No stays found": "Nie znaleziono noclegów", "Playing on YouTube": "Odtwarzanie na YouTube", "Play original track": "Odtwórz oryginalny utwór", "Start planning": "Rozpocznij planowanie", Destinations: "Miejsca docelowe", "Local Life": "Lokalne życie", "Stays & Hotels": "Noclegi i hotele", "Tours & Experiences": "Wycieczki i doświadczenia", "Smart Guide": "Inteligentny przewodnik" },
  cs: { Welcome: "Vítejte", "Primary navigation": "Hlavní navigace", "Mobile navigation": "Mobilní navigace", "Open menu": "Otevřít menu", "Close menu": "Zavřít menu", "Search destinations, stays or experiences": "Hledat destinace, ubytování nebo zážitky", "No results found": "Nebyly nalezeny žádné výsledky", "Footer navigation": "Navigace v zápatí", "List View": "Seznam", "3D Map": "3D mapa", "View Story": "Zobrazit příběh", "Plan Route": "Naplánovat trasu", "Book Tickets": "Rezervovat vstupenky", "Find a Stay": "Najít ubytování", "Save this place": "Uložit toto místo", Saved: "Uloženo", "Continue to request": "Pokračovat v žádosti", "Booking request ready": "Žádost o rezervaci připravena", "Reservation request ready": "Žádost o ubytování připravena", "No experiences found": "Nebyly nalezeny žádné zážitky", "No stays found": "Nebylo nalezeno žádné ubytování", "Playing on YouTube": "Přehrávání na YouTube", "Play original track": "Přehrát původní skladbu", "Start planning": "Začít plánovat", Destinations: "Destinace", "Local Life": "Místní život", "Stays & Hotels": "Ubytování a hotely", "Tours & Experiences": "Prohlídky a zážitky", "Smart Guide": "Chytrý průvodce" },
};

type LanguageContextValue = { locale: LocaleCode; setLocale: (locale: LocaleCode) => void; t: (text: string) => string };
const LanguageContext = createContext<LanguageContextValue | null>(null);
const translationRecords = new WeakMap<Text, { original: string; rendered: string }>();
const attributeRecords = new WeakMap<HTMLElement, Record<string, { original: string; rendered: string }>>();

function translateExact(text: string, locale: LocaleCode) {
  if (locale === "en") return text;
  const leading = text.match(/^\s*/)?.[0] ?? "";
  const trailing = text.match(/\s*$/)?.[0] ?? "";
  const core = text.slice(leading.length, text.length - trailing.length || undefined);
  return `${leading}${translations[locale][core] ?? commonTranslations[locale][core] ?? core}${trailing}`;
}

function translateDocument(locale: LocaleCode) {
  if (typeof document === "undefined" || !document.body) return () => undefined;
  let translating = false;
  let frame = 0;
  let scheduled = false;
  const apply = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode() as Text | null;
    while (node) {
      const parent = node.parentElement;
      if (parent && !parent.closest("[data-no-translate],script,style,textarea,input,select,option,iframe")) {
        const current = node.nodeValue ?? "";
        if (current.trim()) {
          const record = translationRecords.get(node);
          const original = record && current === record.rendered ? record.original : current;
          const translated = translateExact(original, locale);
          translationRecords.set(node, { original, rendered: translated });
          if (current !== translated) node.nodeValue = translated;
        }
      }
      node = walker.nextNode() as Text | null;
    }
    document.querySelectorAll<HTMLElement>("[aria-label], [placeholder], [title]").forEach((element) => {
      const records = attributeRecords.get(element) ?? {};
      for (const attribute of ["aria-label", "placeholder", "title"] as const) {
        const value = element.getAttribute(attribute);
        if (!value) continue;
        const record = records[attribute];
        const original = record && value === record.rendered ? record.original : value;
        const translated = translateExact(original, locale);
        records[attribute] = { original, rendered: translated };
        if (value !== translated) element.setAttribute(attribute, translated);
      }
      attributeRecords.set(element, records);
    });
  };
  apply();
  const observer = new MutationObserver(() => {
    if (translating || scheduled) return;
    scheduled = true;
    frame = window.requestAnimationFrame(() => {
      scheduled = false;
      translating = true;
      apply();
      translating = false;
    });
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  return () => { observer.disconnect(); if (frame) window.cancelAnimationFrame(frame); };
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>("en");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("alpnile-locale") as LocaleCode | null;
    if (saved && localeOptions.some((option) => option.code === saved)) setLocaleState(saved);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.lang = locale === "zh" ? "zh-CN" : locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem("alpnile-locale", locale);
    const pageTitles: Record<string, string> = { "/": "A Thousand Stories", "/about": "About", "/destinations": "Destinations", "/local-life": "Local Life", "/stays-hotels": "Stays & Hotels", "/tours-experiences": "Tours & Experiences", "/trip-planner": "Smart Trip Planner", "/contact": "Contact", "/404": "404", "/500": "500" };
    const title = pageTitles[window.location.pathname] ?? "A Thousand Stories";
    document.title = `AlpNile — ${translateExact(title, locale)}`;
    return translateDocument(locale);
  }, [locale, hydrated]);

  const value = useMemo(() => ({ locale, setLocale: (next: LocaleCode) => setLocaleState(next), t: (text: string) => translateExact(text, locale) }), [locale]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
