CREATE TABLE "platform_settings" (
    "id"                 TEXT NOT NULL DEFAULT 'singleton',
    "siteName"           TEXT NOT NULL DEFAULT 'Rwanda Bus',
    "supportPhone"       TEXT NOT NULL DEFAULT '+250794047261',
    "supportEmail"       TEXT NOT NULL DEFAULT 'rwandabus@gmail.com',
    "supportAddress"     TEXT NOT NULL DEFAULT 'KG 7 Ave, Kigali, Rwanda',
    "whatsappNumber"     TEXT NOT NULL DEFAULT '+250794047261',
    "whatsappMessage"    TEXT NOT NULL DEFAULT 'Hello! I need help with my bus booking.',
    "maintenanceMode"    BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMessage" TEXT NOT NULL DEFAULT 'We are currently performing scheduled maintenance. We''ll be back shortly.',
    "geminiApiKey"       TEXT NOT NULL DEFAULT '',
    "aiModel"            TEXT NOT NULL DEFAULT 'gemini-1.5-flash',
    "aiEnabled"          BOOLEAN NOT NULL DEFAULT true,
    "aiWelcomeMessage"   TEXT NOT NULL DEFAULT 'Hi! I''m your Rwanda Bus assistant. How can I help you today?',
    "facebookUrl"        TEXT NOT NULL DEFAULT '',
    "twitterUrl"         TEXT NOT NULL DEFAULT '',
    "instagramUrl"       TEXT NOT NULL DEFAULT '',
    "updatedAt"          TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);
