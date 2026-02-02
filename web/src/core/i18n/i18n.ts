// Minimal translations for the site. Add keys as needed.
import type { Locale } from "@/i18n/locale";

type Translations = Record<string, string>;

const en: Translations = {
  siteTitle: "Simple Deutsch",
  posts: "Posts",
  categories: "Categories",
  tags: "Tags",
  search: "Search",
  searchPlaceholder: "Find an article",
  searchAria: "Search",
  "search.clear": "Clear",
  clear: "Clear search",
  loading: "Loading…",
  noResults: "No results. Try a different term.",
  loadMore: "Load more",
  menuOpen: "Open menu",
  menuClose: "Close menu",
  home: "Home",
  learn: "Learn",
  forBusiness: "For business & schools",
  coursesLevels: "Courses & levels",
  resources: "Resources",
  company: "Company",
  legalContact: "Legal & contact",
  heroLine1: "Master German",
  heroLine2: "with real skills for",
  heroDescription:
    "Interactive lessons, real-world exercises, and clear progress tracking — learn German at your pace.",
  promoHeading: "Start speaking German today",
  promoCta: "Begin a free lesson",
  tableOfContents: "Table of Contents:",
  noHeadings: "No headings found in this article.",
  moreArticles: "More articles",
  noMoreArticles: "No more articles",
  noPosts: "No posts found.",
  latestPosts: "Latest posts",
  successStories: "Success stories",
  successStoriesDescription:
    "Real stories from learners who improved their German step by step — from beginners to confident speakers. Learn what worked for them and get inspired by practical, achievable progress.",
  noCategories: "No categories found.",
  minRead: "min read",
  viewCategoryAria: "View category",
  /* Page titles and not-found */
  pageNotFoundTitle: "Page Not Found — Simple Deutsch",
  pageNotFoundHeading: "Page Not Found",
  pageNotFoundMessage: "The page you are looking for does not exist or may have been moved.",
  backToHome: "Back to Home",
  /* New notFound keys (preferred) */
  "notFound.title": "Page Not Found",
  "notFound.description": "The page you are looking for does not exist or may have been moved.",
  "notFound.backToHome": "Back to Home",
  postNotFound: "Post not found",
  categoryNotFound: "Category not found",
  tagNotFound: "Tag not found",
  categoriesHeading: "Categories",
  categoryLabel: "Category:",
  tagsHeading: "Tags",
  tagsDescription:
    "Tags indicate the language level of each article according to the CEFR scale — from A1 (beginner) to C2 (near-native). Use them to find content that matches your German level.",
  tagLabel: "Tag:",

  /* Levels (UI rename for tags) */
  levels: "Levels",
  levelsHeading: "Levels",
  levelsDescription:
    "Levels indicate the language level of each article according to the CEFR scale — from A1 (beginner) to C2 (near-native). Use them to find content that matches your German level.",
  levelLabel: "Level:",
  levelNotFound: "Level not found",
  "level.titlePrefix": "Level:",
  a1Title: "A1 (Beginner)",
  a1Description: "Absolute beginner: basic words and simple everyday phrases.",
  a2Title: "A2 (Elementary)",
  a2Description: "Elementary: basic communication in common everyday situations.",
  b1Title: "B1 (Intermediate)",
  b1Description: "Intermediate: independent use of German in familiar topics.",
  b2Title: "B2 (Upper-intermediate)",
  b2Description: "Upper intermediate: confident communication on most topics.",
  c1Title: "C1 (Advanced)",
  c1Description: "Advanced: fluent and flexible language use in complex situations.",
  c2Title: "C2 (Near-native)",
  c2Description: "Near-native: mastery-level understanding and expression.",
  /* Tag page prefix */
  "tag.titlePrefix": "Tag:",
  /* CEFR UI (labels + richer descriptions) */
  "cefr.A1.title": "Beginner",
  "cefr.A1.description":
    "You can understand and use everyday expressions and simple phrases. Great for your first steps in German.",
  "cefr.A2.title": "Elementary",
  "cefr.A2.description":
    "You can communicate in simple, routine situations and describe basic needs. Start building confidence in real-life topics.",
  "cefr.B1.title": "Intermediate",
  "cefr.B1.description":
    "You can handle most situations while traveling and talk about familiar subjects. A solid level for independent learning.",
  "cefr.B2.title": "Upper-intermediate",
  "cefr.B2.description":
    "You can understand main ideas of complex texts and interact more fluently. Ideal for work, studies, and longer conversations.",
  "cefr.C1.title": "Advanced",
  "cefr.C1.description":
    "You can express ideas clearly and use German flexibly in social and professional contexts. Good for academic and professional reading.",
  "cefr.C2.title": "Near-native",
  "cefr.C2.description":
    "You can understand virtually everything and express yourself precisely. Close to native-level comprehension and nuance.",
  /* Footer links */
  courses: "Courses",
  lessons: "Lessons",
  exercises: "Exercises & Tests",
  certificates: "Certificates",
  learningPaths: "Learning Paths",
  businessSolutions: "Business Solutions",
  solutionsSchools: "Solutions for Schools",
  pricing: "Pricing",
  enterprise: "Enterprise",
  levelsA1: "A1 - Beginner",
  levelsA2: "A2 - Elementary",
  levelsB1: "B1 - Intermediate",
  levelsB2: "B2 - Upper Intermediate",
  conversationCourses: "Conversation Courses",
  blog: "Blog",
  podcast: "Podcast",
  faq: "FAQ",
  helpSupport: "Help & Support",
  community: "Community",
  about: "About",
  team: "Team",
  careers: "Careers",
  press: "Press",
  imprint: "Imprint",
  privacy: "Privacy",
  terms: "Terms",
  contact: "Contact",
  /* Privacy policy */
  "privacy.title": "Privacy Policy",
  "privacy.lastUpdated": "Last updated: {date}",
  "privacy.contact": "For questions about this policy, contact {email}.",
  "privacy.s1.title": "1. Introduction",
  "privacy.s1.p":
    "Simple Deutsch provides educational content to help learners study German. This Privacy Policy explains how we collect, use, and protect personal data in connection with our services.",
  "privacy.s2.title": "2. Scope",
  "privacy.s2.p":
    "This policy applies to personal data processed through our website and related services. It does not cover third-party services linked from our site.",
  "privacy.s3.title": "3. Data We Collect",
  "privacy.s3.a.title": "Information you provide voluntarily",
  "privacy.s3.a.p":
    "Account details, form submissions, feedback, and communications you choose to send us.",
  "privacy.s3.b.title": "Automatically collected information",
  "privacy.s3.b.p":
    "Technical data such as IP address, browser type, device identifiers, and basic usage logs collected for operation and security.",
  "privacy.s3.c.title": "Analytics and cookies",
  "privacy.s3.c.p":
    "Anonymous analytics and cookies help us understand site usage and improve the experience.",
  "privacy.s3.d.title": "Sensitive data",
  "privacy.s3.d.p":
    "We do not knowingly collect sensitive personal data. If such data is provided inadvertently, we will delete it unless retention is required by law.",
  "privacy.s4.title": "4. Cookies and Analytics",
  "privacy.s4.a.title": "Functional cookies",
  "privacy.s4.a.p": "Essential cookies enable site functionality and preferences.",
  "privacy.s4.b.title": "Performance and analytics",
  "privacy.s4.b.p":
    "We use aggregated analytics to improve content and measure performance. These do not identify you personally.",
  "privacy.s4.c.title": "Managing cookies",
  "privacy.s4.c.p":
    "You can manage or disable cookies via your browser settings; disabling some cookies may affect site features.",
  "privacy.s5.title": "5. How We Use Data",
  "privacy.s5.p":
    "- To provide and maintain the site\n- To improve and personalize content\n- To respond to inquiries and support requests\n- To monitor and enhance security and performance",
  "privacy.s6.title": "6. Data Sharing",
  "privacy.s6.p":
    "- With service providers who process data on our behalf\n- When required by law or to protect legal rights\n- In aggregated or anonymized form for analysis",
  "privacy.s7.title": "7. Data Retention",
  "privacy.s7.p":
    "We retain personal data only as long as necessary for the purposes described or to comply with legal obligations.",
  "privacy.s8.title": "8. Your Rights (EU/EEA)",
  "privacy.s8.p":
    "You may have rights to access, correct, restrict, or delete your personal data, and to object to or request portability of data. To exercise rights, contact us at the address below.",
  "privacy.s9.title": "9. Data Security",
  "privacy.s9.p":
    "We use administrative, technical, and physical measures to protect personal data but cannot guarantee absolute security.",
  "privacy.s10.title": "10. International Transfers",
  "privacy.s10.p":
    "Data may be processed in countries outside your jurisdiction. We take steps to ensure appropriate safeguards are in place.",
  "privacy.s11.title": "11. Children’s Privacy",
  "privacy.s11.p":
    "Our services are not intended for children under 16. We do not knowingly collect personal data from children; parents should contact us to request deletion.",
  "privacy.s12.title": "12. Changes to This Policy",
  "privacy.s12.p":
    "We may update this policy. Material changes will be indicated by the updated date at the top and, where appropriate, a notice on the site.",
  "privacy.s13.title": "13. Contact",
  "privacy.s13.p": "Contact:",
  /* Terms of Service */
  "terms.title": "Terms of Service",
  "terms.lastUpdated": "{label}: {date}",
  "terms.lastUpdatedLabel": "Last updated",
  "terms.lastUpdatedDate": "2025-12-25",
  "terms.s1.title": "1. Introduction",
  "terms.s1.p":
    'These Terms of Service ("Terms") set out the rules for using Simple Deutsch (the "Service" or "Simple Deutsch"). By accessing or using the Service you agree to these Terms.',
  "terms.s2.title": "2. Definitions",
  "terms.s2.p":
    '"Simple Deutsch" means the website and services operated by Simple Deutsch. "User" means any person who accesses or uses the Service.',
  "terms.s3.title": "3. Eligibility",
  "terms.s3.p":
    "You must be at least 16 years old to use the Service. By using the Service you represent that you meet this age requirement.",
  "terms.s4.title": "4. Acceptable Use",
  "terms.s4.p":
    "- Do not use the Service for unlawful purposes\n- Do not attempt to interfere with the security or operation of the Service\n- Do not post content that infringes others' rights or is abusive, hateful, or pornographic",
  "terms.s5.title": "5. Accounts and User Content",
  "terms.s5.p":
    "If you create an account, you are responsible for your credentials and activity. You grant Simple Deutsch a non-exclusive, worldwide license to display content you post on the Service.",
  "terms.s6.title": "6. Intellectual Property",
  "terms.s6.p":
    "All site content is the property of Simple Deutsch or its licensors and is protected by copyright. You may view and share content for personal, non-commercial use only.",
  "terms.s7.title": "7. Third-party Links",
  "terms.s7.p":
    "The Service may contain links to third-party sites. We are not responsible for their content or practices.",
  "terms.s8.title": "8. Disclaimers",
  "terms.s8.p":
    'The Service is provided "as is" without warranties of any kind. We do not guarantee accuracy or availability of content.',
  "terms.s9.title": "9. Limitation of Liability",
  "terms.s9.p":
    "To the maximum extent permitted by law, Simple Deutsch and its affiliates will not be liable for indirect, incidental, or consequential damages arising from your use of the Service.",
  "terms.s10.title": "10. Changes to Terms",
  "terms.s10.p":
    "We may modify these Terms. Material changes will be indicated by the updated date at the top. Continued use of the Service constitutes acceptance of the updated Terms.",
  "terms.s11.title": "11. Contact",
  "terms.s11.p": "For questions about these Terms contact",
  /* Imprint / Impressum */
  "imprint.title": "Imprint",
  "imprint.lastUpdated": "Last updated: {date}",
  "imprint.lastUpdatedLabel": "Last updated:",
  "imprint.lastUpdatedDate": "2025-12-27",
  "imprint.s1.title": "1. Operator / Site Owner",
  "imprint.s1.p":
    "This website is operated by a private individual.\\nMaksym Poliakovskyi\\nMurtener Straße, 12205 Berlin, Germany",
  "imprint.s2.title": "2. Contact",
  "imprint.s2.p": "Email: hello@simpledeutsch.com",
  "imprint.s3.title": "3. Responsible for content",
  "imprint.s3.intro": "Responsible for the content according to applicable law:",
  "imprint.s3.name": "Maksym Poliakovskyi",
  "imprint.s3.address": "Murtener Straße, 12205 Berlin, Germany",
  "imprint.s4.title": "4. Liability for content",
  "imprint.s4.p":
    "Disclaimer: We make reasonable efforts to ensure the accuracy and timeliness of the content, but we cannot guarantee completeness, accuracy, or timeliness. Responsibility applies only to content that we have created ourselves, in accordance with applicable law.",
  "imprint.s5.title": "5. Liability for links",
  "imprint.s5.p":
    "This website may contain links to third-party sites. We have no control over their content and are not responsible for them.",
  "imprint.s6.title": "6. Copyright",
  "imprint.s6.p":
    "All content and materials on this site are protected by copyright. Reproduction or use requires prior written consent unless permitted by law.",
  "imprint.s7.title": "7. Dispute resolution / Consumer arbitration",
  "imprint.s7.p":
    "We are not obliged nor willing to participate in dispute resolution proceedings before a consumer arbitration board.",
  /* Theme labels */
  darkMode: "Dark theme",
  lightMode: "Light theme",
  /* Footer */
  "footer.copyright":
    "© {year} Simple Deutsch. German-language learning platform. All rights reserved.",
};

const uk: Translations = {
  siteTitle: "Simple Deutsch",
  posts: "Пости",
  categories: "Категорії",
  tags: "Теги",
  search: "Пошук",
  searchPlaceholder: "Знайти статтю",
  searchAria: "Пошук",
  "search.clear": "Очистити",
  clear: "Очистити пошук",
  loading: "Завантаження…",
  noResults: "Нічого не знайдено. Спробуйте інший запит.",
  loadMore: "Показати ще",
  menuOpen: "Відкрити меню",
  menuClose: "Закрити меню",
  home: "Головна",
  learn: "Вивчати",
  forBusiness: "Для бізнесу та шкіл",
  coursesLevels: "Курси та рівні",
  resources: "Ресурси",
  company: "Компанія",
  legalContact: "Правова інформація та контакти",
  heroLine1: "Вивчай німецьку",
  heroLine2: "із реальними навичками для",
  heroDescription:
    "Інтерактивні уроки, вправи з реальних ситуацій і зручне відстеження прогресу — вивчайте німецьку у власному темпі.",
  promoHeading: "Почніть говорити німецькою сьогодні",
  promoCta: "Розпочати безкоштовний урок",
  tableOfContents: "Зміст:",
  noHeadings: "У цій статті не знайдено заголовків.",
  moreArticles: "Інші статті",
  noMoreArticles: "Більше статей немає.",
  noPosts: "Публікацій не знайдено.",
  latestPosts: "Останні пости",
  successStories: "Історії успіху",
  successStoriesDescription:
    "Реальні історії людей, які крок за кроком покращували свою німецьку — від початківців до впевнених мовців. Дізнайтеся, що допомогло їм, і надихніться практичним, досяжним прогресом.",
  noCategories: "Категорій не знайдено.",
  minRead: "хв читання",
  viewCategoryAria: "Переглянути категорію",
  /* Page titles and not-found */
  pageNotFoundTitle: "Сторінку не знайдено — Simple Deutsch",
  pageNotFoundHeading: "Сторінку не знайдено",
  pageNotFoundMessage: "Сторінку, яку ви шукаєте, не знайдено або її було переміщено.",
  backToHome: "Повернутися на головну",
  /* New notFound keys (preferred) */
  "notFound.title": "Сторінку не знайдено",
  "notFound.description": "Сторінку, яку ви шукаєте, не знайдено або її було переміщено.",
  "notFound.backToHome": "Повернутися на головну",
  postNotFound: "Публікацію не знайдено",
  categoryNotFound: "Категорію не знайдено",
  tagNotFound: "Тег не знайдено",
  categoriesHeading: "Категорії",
  categoryLabel: "Категорія:",
  tagsHeading: "Теги",
  tagsDescription:
    "Теги вказують рівень мови кожної статті за шкалою CEFR — від A1 (початковий) до C2 (рівень носія мови). Використовуйте їх, щоб знайти контент, який відповідає вашому рівню німецької мови.",
  tagLabel: "Тег:",

  /* Levels (UI rename for tags) */
  levels: "Рівні",
  levelsHeading: "Рівні",
  levelsDescription:
    "Рівні вказують рівень мови кожної статті за шкалою CEFR — від A1 (початковий) до C2 (рівень носія мови). Використовуйте їх, щоб знайти контент, який відповідає вашому рівню німецької мови.",
  levelLabel: "Рівень:",
  levelNotFound: "Рівень не знайдено",
  "level.titlePrefix": "Рівень:",
  a1Title: "A1 — Початковий",
  a1Description: "Початковий рівень: базові слова та прості повсякденні фрази.",
  a2Title: "A2 — Елементарний",
  a2Description: "Елементарний: базове спілкування в звичайних повсякденних ситуаціях.",
  b1Title: "B1 — Середній",
  b1Description: "Середній: самостійне використання німецької у знайомих темах.",
  b2Title: "B2 — Вище середнього",
  b2Description: "Вище середнього: впевнене спілкування на більшості тем.",
  c1Title: "C1 — Просунутий",
  c1Description: "Просунутий: вільне та гнучке використання мови у складних ситуаціях.",
  c2Title: "C2 — Рівень носія",
  c2Description: "Рівень носія мови: майстерне розуміння та вираження думок.",
  /* Tag page prefix */
  "tag.titlePrefix": "Тег:",
  /* CEFR UI (labels + richer descriptions) */
  "cefr.A1.title": "Початковий",
  "cefr.A1.description":
    "Ви можете розуміти та використовувати повсякденні вирази та прості фрази. Чудово підходить для перших кроків у німецькій.",
  "cefr.A2.title": "Елементарний",
  "cefr.A2.description":
    "Ви можете спілкуватися в простих, повсякденних ситуаціях і описувати базові потреби. Почніть набувати впевненості в реальних темах.",
  "cefr.B1.title": "Середній",
  "cefr.B1.description":
    "Ви можете справлятися з більшістю ситуацій під час подорожей і говорити на знайомі теми. Надійний рівень для самостійного навчання.",
  "cefr.B2.title": "Вище середнього",
  "cefr.B2.description":
    "Ви можете розуміти основні ідеї складних текстів і спілкуватися більш плавно. Ідеально для роботи, навчання та довших розмов.",
  "cefr.C1.title": "Просунутий",
  "cefr.C1.description":
    "Ви можете чітко виражати думки та гнучко використовувати німецьку в соціальних і професійних контекстах. Підходить для академічного та професійного читання.",
  "cefr.C2.title": "Рівень носія",
  "cefr.C2.description":
    "Ви можете розуміти практично все і висловлюватися точно. Близько до рідного рівня розуміння та нюансів.",
  /* Footer links */
  courses: "Курси",
  lessons: "Уроки",
  exercises: "Вправи та тести",
  certificates: "Сертифікати",
  learningPaths: "Навчальні шляхи",
  businessSolutions: "Рішення для бізнесу",
  solutionsSchools: "Рішення для шкіл",
  pricing: "Ціни",
  enterprise: "Підприємствам",
  levelsA1: "A1 - Початковий",
  levelsA2: "A2 - Елементарний",
  levelsB1: "B1 - Середній",
  levelsB2: "B2 - Вище середнього",
  conversationCourses: "Розмовні курси",
  blog: "Блог",
  podcast: "Подкаст",
  faq: "Питання та відповіді",
  helpSupport: "Допомога та підтримка",
  community: "Спільнота",
  about: "Про нас",
  team: "Команда",
  careers: "Вакансії",
  press: "Преса",
  imprint: "Юридична інформація",
  privacy: "Політика конфіденційності",
  terms: "Умови",
  contact: "Контакти",
  /* Privacy policy */
  "privacy.title": "Політика конфіденційності",
  "privacy.lastUpdated": "Оновлено: {date}",
  "privacy.contact": "За питаннями цієї політики пишіть: {email}.",
  "privacy.s1.title": "1. Вступ",
  "privacy.s1.p":
    "Simple Deutsch надає освітній контент для вивчення німецької мови. Ця Політика конфіденційності пояснює, як ми збираємо, використовуємо та захищаємо персональні дані.",
  "privacy.s2.title": "2. Область застосування",
  "privacy.s2.p":
    "Політика застосовується до персональних даних, що обробляються через наш сайт та пов'язані сервіси. Вона не охоплює сторонні сервіси, на які ведуть посилання.",
  "privacy.s3.title": "3. Дані, які ми збираємо",
  "privacy.s3.a.title": "Інформація, яку ви надаєте добровільно",
  "privacy.s3.a.p": "Дані акаунта, форми, відгуки та повідомлення, які ви надсилаєте.",
  "privacy.s3.b.title": "Автоматично зібрана інформація",
  "privacy.s3.b.p":
    "Технічні дані: IP-адреса, тип браузера, ідентифікатори пристрою та базові журнали використання, що збираються для роботи та безпеки.",
  "privacy.s3.c.title": "Аналітика та cookie",
  "privacy.s3.c.p":
    "Анонімна аналітика та cookie допомагають нам розуміти використання сайту та покращувати роботу.",
  "privacy.s3.d.title": "Чутливі дані",
  "privacy.s3.d.p":
    "Ми не збираємо навмисно чутливі персональні дані. Якщо такі дані будуть надані випадково, ми видалимо їх, якщо інше не вимагається законом.",
  "privacy.s4.title": "4. Cookie та аналітика",
  "privacy.s4.a.title": "Функціональні cookie",
  "privacy.s4.a.p": "Необхідні cookie забезпечують роботу сайту та збереження налаштувань.",
  "privacy.s4.b.title": "Продуктивність та аналітика",
  "privacy.s4.b.p":
    "Ми використовуємо агреговану аналітику для покращення контенту та оцінки продуктивності. Ці дані не ідентифікують вас особисто.",
  "privacy.s4.c.title": "Управління cookie",
  "privacy.s4.c.p":
    "Ви можете керувати або відключати cookie в налаштуваннях браузера; це може обмежити функціональність сайту.",
  "privacy.s5.title": "5. Як ми використовуємо дані",
  "privacy.s5.p":
    "- Для надання та підтримки сайту\n- Для покращення та персоналізації контенту\n- Для відповіді на запити та звернення підтримки\n- Для моніторингу безпеки та продуктивності",
  "privacy.s6.title": "6. Передача даних",
  "privacy.s6.p":
    "- Постачальникам послуг, які обробляють дані від нашого імені\n- Коли це вимагається за законом або для захисту прав\n- В агрегованому або анонімізованому вигляді для аналізу",
  "privacy.s7.title": "7. Зберігання даних",
  "privacy.s7.p":
    "Ми зберігаємо персональні дані лише протягом часу, необхідного для цілей, описаних у цій політиці, або для виконання правових зобов'язань.",
  "privacy.s8.title": "8. Ваші права (EU/EEA)",
  "privacy.s8.p":
    "Ви можете мати права на доступ, виправлення, обмеження або видалення своїх даних, а також заперечувати обробку або вимагати перенесення даних. Щоб реалізувати права, зв'яжіться з нами.",
  "privacy.s9.title": "9. Безпека даних",
  "privacy.s9.p":
    "Ми використовуємо адміністративні й технічні заходи для захисту персональних даних, але не можемо гарантувати абсолютну безпеку.",
  "privacy.s10.title": "10. Міжнародні передачі",
  "privacy.s10.p":
    "Дані можуть оброблятися в інших країнах. Ми вживаємо заходів для забезпечення належних гарантій.",
  "privacy.s11.title": "11. Конфіденційність дітей",
  "privacy.s11.p":
    "Наші сервіси не призначені для дітей до 16 років. Ми не збираємо навмисно дані дітей; батьки можуть звернутися до нас з проханням про видалення.",
  "privacy.s12.title": "12. Зміни в політиці",
  "privacy.s12.p":
    "Ми можемо оновлювати цю політику. Суще́льні зміни будуть позначені оновленою датою вгорі та, за потреби, повідомленням на сайті.",
  "privacy.s13.title": "13. Контакти",
  "privacy.s13.p": "Контакти:",
  /* Terms of Service */
  "terms.title": "Умови користування",
  "terms.lastUpdated": "{label} {date}",
  "terms.lastUpdatedLabel": "Останнє оновлення:",
  "terms.lastUpdatedDate": "2025-12-25",
  "terms.s1.title": "1. Вступ",
  "terms.s1.p":
    "Ці Умови користування («Умови») встановлюють правила використання Simple Deutsch (далі — «Сервіс» або «Simple Deutsch»). Отримуючи доступ до Сервісу або користуючись ним, ви погоджуєтеся з цими Умовами.",
  "terms.s2.title": "2. Визначення",
  "terms.s2.p":
    "«Simple Deutsch» означає веб-сайт і сервіси, якими керує Simple Deutsch. «Користувач» означає будь-яку особу, яка отримує доступ до Сервісу або користується ним.",
  "terms.s3.title": "3. Право на користування",
  "terms.s3.p":
    "Щоб користуватися Сервісом, вам має бути щонайменше 16 років. Користуючись Сервісом, ви підтверджуєте, що відповідаєте цій віковій вимозі.",
  "terms.s4.title": "4. Допустиме використання",
  "terms.s4.p":
    "- Не використовуйте Сервіс для незаконних цілей\n- Не намагайтеся втручатися в роботу або безпеку Сервісу\n- Не публікуйте контент, який порушує права інших, є образливим, дискримінаційним або порнографічним",
  "terms.s5.title": "5. Акаунти та контент користувачів",
  "terms.s5.p":
    "Якщо ви створюєте акаунт, ви відповідаєте за свої облікові дані та активність. Ви надаєте Simple Deutsch невиключну, світову ліцензію на публікацію та відображення контенту, який ви розміщуєте у Сервісі.",
  "terms.s6.title": "6. Інтелектуальна власність",
  "terms.s6.p":
    "Весь контент сайту належить Simple Deutsch або його ліцензіарам і захищений авторським правом. Ви можете переглядати та ділитися контентом лише для особистого некомерційного використання.",
  "terms.s7.title": "7. Посилання на сторонні ресурси",
  "terms.s7.p":
    "Сервіс може містити посилання на сторонні сайти. Ми не несемо відповідальності за їхній контент або практики.",
  "terms.s8.title": "8. Відмова від гарантій",
  "terms.s8.p":
    "Сервіс надається «як є» без будь-яких гарантій. Ми не гарантуємо точність або доступність контенту.",
  "terms.s9.title": "9. Обмеження відповідальності",
  "terms.s9.p":
    "У максимально дозволеному законом обсязі Simple Deutsch та його афілійовані особи не несуть відповідальності за непрямі, побічні або наслідкові збитки, що виникають у зв'язку з використанням вами Сервісу.",
  "terms.s10.title": "10. Зміни до Умов",
  "terms.s10.p":
    "Ми можемо оновлювати ці Умови. Суще́льні зміни будуть позначені оновленою датою вгорі. Продовження використання Сервісу означає прийняття оновлених Умов.",
  "terms.s11.title": "11. Контакти",
  "terms.s11.p": "За питаннями щодо цих Умов звертайтесь",
  /* Imprint / Impressum */
  "imprint.title": "Юридична інформація",
  "imprint.lastUpdated": "Останнє оновлення: {date}",
  "imprint.lastUpdatedLabel": "Останнє оновлення:",
  "imprint.lastUpdatedDate": "2025-12-27",
  "imprint.s1.title": "1. Оператор / Власник сайту",
  "imprint.s1.p":
    "Цей вебсайт управляється приватною особою.\\nMaksym Poliakovskyi\\nMurtener Straße, 12205 Berlin, Germany",
  "imprint.s2.title": "2. Контакти",
  "imprint.s2.p": "Email: hello@simpledeutsch.com",
  "imprint.s3.title": "3. Відповідальний за зміст",
  "imprint.s3.intro": "Відповідальний за зміст відповідно до чинного законодавства:",
  "imprint.s3.name": "Maksym Poliakovskyi",
  "imprint.s3.address": "Murtener Straße, 12205 Berlin, Germany",
  "imprint.s4.title": "4. Відповідальність за зміст",
  "imprint.s4.p":
    "Відмова від гарантій: Ми докладаємо розумних зусиль для забезпечення точності та актуальності вмісту, проте не можемо гарантувати повноту, точність або своєчасність. Відповідальність поширюється лише на власний вміст відповідно до застосовного законодавства.",
  "imprint.s5.title": "5. Відповідальність за посилання",
  "imprint.s5.p":
    "Вебсайт може містити посилання на сторонні ресурси. Ми не контролюємо їхній вміст і не несемо за нього відповідальності.",
  "imprint.s6.title": "6. Авторське право",
  "imprint.s6.p":
    "Весь вміст і матеріали на цьому сайті захищені авторським правом. Відтворення або використання вимагає попередньої письмової згоди, якщо інше не передбачено законом.",
  "imprint.s7.title": "7. Вирішення спорів / Споживча арбітраж",
  "imprint.s7.p":
    "Ми не зобов'язані і не готові брати участь у процедурах розв'язання спорів перед споживчим арбітражним органом.",
  /* Theme labels */
  darkMode: "Темна тема",
  lightMode: "Світла тема",
  /* Footer */
  "footer.copyright":
    "© {year} Simple Deutsch. Платформа для вивчення німецької мови. Усі права захищені.",
};

const ru: Translations = {
  siteTitle: "Simple Deutsch",
  posts: "Посты",
  categories: "Категории",
  tags: "Теги",
  search: "Поиск",
  searchPlaceholder: "Найти статью",
  searchAria: "Поиск",
  "search.clear": "Очистить",
  clear: "Очистить поиск",
  loading: "Загрузка…",
  noResults: "Результатов не найдено. Попробуйте другой запрос.",
  loadMore: "Показать ещё",
  menuOpen: "Открыть меню",
  menuClose: "Закрыть меню",
  home: "Главная",
  learn: "Изучать",
  forBusiness: "Для бизнеса и школ",
  coursesLevels: "Курсы и уровни",
  resources: "Ресурсы",
  company: "Компания",
  legalContact: "Юридическая информация и контакты",
  heroLine1: "Освой немецкий",
  heroLine2: "с реальными навыками для",
  heroDescription:
    "Интерактивные уроки, упражнения из реальных ситуаций и удобный трекер прогресса — учите немецкий в своем темпе.",
  promoHeading: "Начните говорить по‑немецки уже сегодня",
  promoCta: "Начать бесплатный урок",
  tableOfContents: "Оглавление:",
  noHeadings: "В этой статье не найдено заголовков.",
  moreArticles: "Больше статей",
  noMoreArticles: "Больше статей нет.",
  noPosts: "Публикаций не найдено.",
  latestPosts: "Последние записи",
  successStories: "Истории успеха",
  successStoriesDescription:
    "Реальные истории людей, которые шаг за шагом улучшали свой немецкий — от начинающих до уверенных говорящих. Узнайте, что сработало для них, и вдохновляйтесь практичным, достижимым прогрессом.",
  noCategories: "Категорий не найдено.",
  minRead: "мин чтения",
  viewCategoryAria: "Просмотреть категорию",
  /* Page titles and not-found */
  pageNotFoundTitle: "Страница не найдена — Simple Deutsch",
  pageNotFoundHeading: "Страница не найдена",
  pageNotFoundMessage: "Страница, которую вы ищете, не существует или была перемещена.",
  backToHome: "Вернуться на главную",
  /* New notFound keys (preferred) */
  "notFound.title": "Страница не найдена",
  "notFound.description": "Страница, которую вы ищете, не существует или была перемещена.",
  "notFound.backToHome": "Вернуться на главную",
  postNotFound: "Публиция не найдена",
  categoryNotFound: "Категория не найдена",
  tagNotFound: "Тег не найден",
  categoriesHeading: "Категории",
  categoryLabel: "Категория:",
  tagsHeading: "Теги",
  tagsDescription:
    "Теги указывают уровень языка каждой статьи по шкале CEFR — от A1 (начальный) до C2 (уровень носителя языка). Используйте их, чтобы найти контент, соответствующий вашему уровню немецкого языка.",
  tagLabel: "Тег:",
  /* Levels (UI rename for tags) */
  levels: "Уровни",
  levelsHeading: "Уровни",
  levelsDescription:
    "Уровни указывают уровень языка каждой статьи по шкале CEFR — от A1 (начальный) до C2 (уровень носителя языка). Используйте их, чтобы найти контент, соответствующий вашему уровню немецкого языка.",
  levelLabel: "Уровень:",
  levelNotFound: "Уровень не найден",
  "level.titlePrefix": "Уровень:",
  a1Title: "A1 — Начальный",
  a1Description: "Начальный уровень: базовые слова и простые повседневные фразы.",
  a2Title: "A2 — Элементарный",
  a2Description: "Элементарный: базовое общение в обычных повседневных ситуациях.",
  b1Title: "B1 — Средний",
  b1Description: "Средний: самостоятельное использование немецкого в знакомых темах.",
  b2Title: "B2 — Выше среднего",
  b2Description: "Выше среднего: уверенное общение на большинстве тем.",
  c1Title: "C1 — Продвинутый",
  c1Description: "Продвинутый: свободное и гибкое использование языка в сложных ситуациях.",
  c2Title: "C2 — Уровень носителя",
  c2Description: "Уровень носителя языка: мастерское понимание и выражение мыслей.",
  /* Tag page prefix */
  "tag.titlePrefix": "Тег:",
  /* CEFR UI (labels + richer descriptions) */
  "cefr.A1.title": "Начальный",
  "cefr.A1.description":
    "Вы можете понимать и использовать повседневные выражения и простые фразы. Отлично подходит для ваших первых шагов в немецком языке.",
  "cefr.A2.title": "Элементарный",
  "cefr.A2.description":
    "Вы можете общаться в простых, повседневных ситуациях и описывать базовые потребности. Начните укреплять уверенность в реальных темах.",
  "cefr.B1.title": "Средний",
  "cefr.B1.description":
    "Вы можете справляться с большинством ситуаций во время путешествий и говорить на знакомые темы. Надёжный уровень для самостоятельного обучения.",
  "cefr.B2.title": "Выше среднего",
  "cefr.B2.description":
    "Вы можете понимать основные идеи сложных текстов и взаимодействовать более бегло. Идеально для работы, учёбы и длительных разговоров.",
  "cefr.C1.title": "Продвинутый",
  "cefr.C1.description":
    "Вы можете ясно выражать мысли и гибко использовать немецкий в социальных и профессиональных контекстах. Подходит для академического и профессионального чтения.",
  "cefr.C2.title": "Уровень носителя",
  "cefr.C2.description":
    "Вы можете понимать практически всё и выражать себя точно. Близко к уровню носителя по пониманию и нюансам.",
  /* Footer links */
  courses: "Курсы",
  lessons: "Уроки",
  exercises: "Упражнения и тесты",
  certificates: "Сертификаты",
  learningPaths: "Учебные программы",
  businessSolutions: "Решения для бизнеса",
  solutionsSchools: "Решения для школ",
  pricing: "Цены",
  enterprise: "Корпоративным клиентам",
  levelsA1: "A1 - Начальный",
  levelsA2: "A2 - Элементарный",
  levelsB1: "B1 - Средний",
  levelsB2: "B2 - Выше среднего",
  conversationCourses: "Разговорные курсы",
  blog: "Блог",
  podcast: "Подкаст",
  faq: "Часто задаваемые вопросы",
  helpSupport: "Помощь и поддержка",
  community: "Сообщество",
  about: "О проекте",
  team: "Команда",
  careers: "Карьера",
  press: "Пресса",
  imprint: "Выходные данные",
  privacy: "Политика конфиденциальности",
  terms: "Условия",
  contact: "Контакты",
  /* Privacy policy */
  "privacy.title": "Политика конфиденциальности",
  "privacy.lastUpdated": "Обновлено: {date}",
  "privacy.contact": "По вопросам этой политики пишите: {email}.",
  "privacy.s1.title": "1. Введение",
  "privacy.s1.p":
    "Simple Deutsch предоставляет образовательный контент для изучения немецкого языка. Эта Политика конфиденциальности объясняет, как мы собираем, используем и защищаем персональные данные.",
  "privacy.s2.title": "2. Область применения",
  "privacy.s2.p":
    "Политика применяется к персональным данным, обрабатываемым через наш сайт и связанные сервисы. Она не охватывает сторонние ресурсы, на которые мы ссылаемся.",
  "privacy.s3.title": "3. Какие данные мы собираем",
  "privacy.s3.a.title": "Информация, которую вы предоставляете добровольно",
  "privacy.s3.a.p": "Данные аккаунта, формы, отзывы и сообщения, которые вы отправляете.",
  "privacy.s3.b.title": "Автоматически собираемая информация",
  "privacy.s3.b.p":
    "Технические данные: IP-адрес, тип браузера, идентификаторы устройства и базовые журналы использования, собираемые для работы и безопасности.",
  "privacy.s3.c.title": "Аналитика и cookies",
  "privacy.s3.c.p":
    "Анонимная аналитика и cookie помогают понять использование сайта и улучшить работу.",
  "privacy.s3.d.title": "Чувствительные данные",
  "privacy.s3.d.p":
    "Мы не намеренно собираем чувствительные персональные данные. Если такие данные поступят случайно, мы удалим их, если иное не требуется по закону.",
  "privacy.s4.title": "4. Cookies и аналитика",
  "privacy.s4.a.title": "Функциональные cookie",
  "privacy.s4.a.p": "Необходимые cookie обеспечивают работу сайта и сохранение предпочтений.",
  "privacy.s4.b.title": "Производительность и аналитика",
  "privacy.s4.b.p":
    "Мы используем агрегированную аналитику для улучшения контента и оценки производительности. Эти данные не идентифицируют вас лично.",
  "privacy.s4.c.title": "Управление cookie",
  "privacy.s4.c.p":
    "Вы можете управлять или отключать cookie в настройках браузера; это может ограничить функциональность сайта.",
  "privacy.s5.title": "5. Как мы используем данные",
  "privacy.s5.p":
    "- Для предоставления и поддержки сайта\n- Для улучшения и персонализации контента\n- Для ответа на запросы и поддержки\n- Для мониторинга безопасности и производительности",
  "privacy.s6.title": "6. Передача данных",
  "privacy.s6.p":
    "- Поставщикам услуг, обрабатывающим данные от нашего имени\n- Когда это требуется по закону или для защиты прав\n- В агрегированном или анонимизированном виде для анализа",
  "privacy.s7.title": "7. Сохранение данных",
  "privacy.s7.p":
    "Мы храним персональные данные только столько, сколько необходимо для целей, указанных в этой политике, или для соблюдения правовых обязательств.",
  "privacy.s8.title": "8. Ваши права (ЕАЭС/ЕС)",
  "privacy.s8.p":
    "Вы можете иметь права на доступ, исправление, ограничение или удаление данных, а также возражать против обработки или запросить переносимость. Для реализации прав свяжитесь с нами.",
  "privacy.s9.title": "9. Безопасность данных",
  "privacy.s9.p":
    "Мы применяем административные и технические меры для защиты персональных данных, но не можем гарантировать абсолютную безопасность.",
  "privacy.s10.title": "10. Международные передачи",
  "privacy.s10.p":
    "Данные могут обрабатываться в других странах. Мы принимаем меры для обеспечения надлежащих гарантий.",
  "privacy.s11.title": "11. Конфиденциальность детей",
  "privacy.s11.p":
    "Наши сервисы не предназначены для детей до 16 лет. Мы не намеренно собираем данные детей; родители могут обратиться к нам с просьбой об удалении.",
  "privacy.s12.title": "12. Изменения в политике",
  "privacy.s12.p":
    "Мы можем обновлять эту политику. Существенные изменения будут отмечены обновлённой датой вверху и, при необходимости, уведомлением на сайте.",
  "privacy.s13.title": "13. Контакты",
  "privacy.s13.p": "Контакты:",
  /* Terms of Service */
  "terms.title": "Условия использования",
  "terms.lastUpdated": "{label} {date}",
  "terms.lastUpdatedLabel": "Последнее обновление:",
  "terms.lastUpdatedDate": "2025-12-25",
  "terms.s1.title": "1. Введение",
  "terms.s1.p":
    "Настоящие Условия использования («Условия») устанавливают правила использования Simple Deutsch (далее — «Сервис» или «Simple Deutsch»). Получая доступ к Сервису или используя его, вы соглашаетесь с настоящими Условиями.",
  "terms.s2.title": "2. Определения",
  "terms.s2.p":
    "«Simple Deutsch» означает веб-сайт и сервисы, управляемые Simple Deutsch. «Пользователь» означает любое лицо, которое получает доступ к Сервису или использует его.",
  "terms.s3.title": "3. Право на использование",
  "terms.s3.p":
    "Для использования Сервиса вам должно быть не менее 16 лет. Используя Сервис, вы подтверждаете, что соответствуете этому возрастному требованию.",
  "terms.s4.title": "4. Допустимое использование",
  "terms.s4.p":
    "- Не используйте Сервис для незаконных целей\n- Не пытайтесь вмешиваться в работу или безопасность Сервиса\n- Не публикуйте контент, который нарушает права других, является оскорбительным, дискриминационным или порнографическим",
  "terms.s5.title": "5. Аккаунты и контент пользователей",
  "terms.s5.p":
    "Если вы создаёте аккаунт, вы несёте ответственность за свои учётные данные и действия. Вы предоставляете Simple Deutsch неисключительную, мировую лицензию на публикацию и отображение контента, который вы размещаете в Сервисе.",
  "terms.s6.title": "6. Интеллектуальная собственность",
  "terms.s6.p":
    "Весь контент сайта принадлежит Simple Deutsch или его лицензиарам и защищён авторским правом. Вы можете просматривать и делиться контентом только для личного некоммерческого использования.",
  "terms.s7.title": "7. Ссылки на сторонние сайты",
  "terms.s7.p":
    "Сервис может содержать ссылки на сторонние сайты. Мы не несем ответственности за их содержание или практики.",
  "terms.s8.title": "8. Отказ от гарантий",
  "terms.s8.p":
    'Сервис предоставляется "как есть" без каких‑либо гарантий. Мы не гарантируем точность или доступность контента.',
  "terms.s9.title": "9. Ограничение ответственности",
  "terms.s9.p":
    "В максимально допустимой законом степени Simple Deutsch и его аффилированные лица не несут ответственности за косвенные, побочные или последующие убытки, возникающие в связи с использованием вами Сервиса.",
  "terms.s10.title": "10. Изменения Условий",
  "terms.s10.p":
    "Мы можем вносить изменения в эти Условия. Существенные изменения будут отмечены обновлённой датой вверху. Продолжение использования Сервиса означает принятие обновлённых Условий.",
  "terms.s11.title": "11. Контакты",
  "terms.s11.p": "По вопросам, связанным с настоящими Условиями, обращайтесь",
  /* Imprint / Impressum */
  "imprint.title": "Выходные данные",
  "imprint.lastUpdated": "Последнее обновление: {date}",
  "imprint.lastUpdatedLabel": "Последнее обновление:",
  "imprint.lastUpdatedDate": "2025-12-27",
  "imprint.s1.title": "1. Оператор / Владелец сайта",
  "imprint.s1.p":
    "Этот веб-сайт управляется частным лицом.\\nMaksym Poliakovskyi\\nMurtener Straße, 12205 Berlin, Germany",
  "imprint.s2.title": "2. Контакты",
  "imprint.s2.p": "Email: hello@simpledeutsch.com",
  "imprint.s3.title": "3. Ответственный за содержание",
  "imprint.s3.intro": "Ответственный за содержание в соответствии с применимым законодательством:",
  "imprint.s3.name": "Maksym Poliakovskyi",
  "imprint.s3.address": "Murtener Straße, 12205 Berlin, Germany",
  "imprint.s4.title": "4. Ответственность за содержимое",
  "imprint.s4.p":
    "Отказ от гарантий: Мы прилагаем разумные усилия для обеспечения точности и актуальности содержимого, но не можем гарантировать полноту, точность или своевременность. Ответственность распространяется только на собственный контент в соответствии с применимым законодательством.",
  "imprint.s5.title": "5. Ответственность за ссылки",
  "imprint.s5.p":
    "Сайт может содержать ссылки на сторонние ресурсы. Мы не контролируем их содержание и не несем ответственности за них.",
  "imprint.s6.title": "6. Авторское право",
  "imprint.s6.p":
    "Весь контент и материалы на этом сайте защищены авторским правом. Воспроизведение или использование требует предварительного письменного согласия, если иное не разрешено законом.",
  "imprint.s7.title": "7. Урегулирование споров / Потребительский арбитраж",
  "imprint.s7.p":
    "Мы не обязаны и не готовы участвовать в процедурах урегулирования споров перед потребительской арбитражной комиссией.",
  /* Theme labels */
  darkMode: "Тёмная тема",
  lightMode: "Светлая тема",
  /* Footer */
  "footer.copyright":
    "© {year} Simple Deutsch. Платформа для изучения немецкого языка. Все права защищены.",
};

export const TRANSLATIONS: Record<Locale, Translations> = {
  en,
  uk,
  ru,
};

export const DEFAULT_LOCALE: Locale = "en";

// Merge in content translations from JSON files (about page)
import aboutEn from "@/content/i18n/about.en.json";
import aboutRu from "@/content/i18n/about.ru.json";
import aboutUk from "@/content/i18n/about.uk.json";

// Note: extend base translation objects with about.* keys
Object.assign(en, aboutEn as Translations);
Object.assign(uk, aboutUk as Translations);
Object.assign(ru, aboutRu as Translations);
