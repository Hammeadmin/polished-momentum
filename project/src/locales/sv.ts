/**
 * Swedish Localization Strings (sv-SE)
 * Centralized string management for the application
 */

// =============================================================================
// GREETINGS
// =============================================================================

export const GREETINGS = {
    MORNING: 'God morgon',
    DAY: 'God dag',
    EVENING: 'God kväll',
} as const;

/**
 * Get appropriate Swedish greeting based on hour
 */
export const getGreeting = (hour: number): string => {
    if (hour < 10) return GREETINGS.MORNING;
    if (hour < 17) return GREETINGS.DAY;
    if (hour > 20) return GREETINGS.EVENING;
    return GREETINGS.DAY;
};

// =============================================================================
// NAVIGATION
// =============================================================================

export const NAV = {
    DASHBOARD: 'Dashboard',
    SALES_TUNNEL: 'Säljtunnel',
    ORDERS: 'Orderhantering',
    CUSTOMERS: 'Kunder',
    QUOTES: 'Offerter',
    LEADS: 'Förfrågningar',
    CALENDAR: 'Kalender',
    INVOICES: 'Fakturor',
    COMMUNICATION: 'Kommunikation',
    TEAM: 'Team',
    PAYROLL: 'Lönehantering',
    DOCUMENTS: 'Dokument',
    REPORTS: 'Rapporter',
    INTRANET: 'Intranät',
    ANALYTICS: 'Analys',
    SETTINGS: 'Inställningar',
} as const;

// =============================================================================
// KPI LABELS
// =============================================================================

export const KPI = {
    TOTAL_SALES: 'Total Försäljning',
    TOTAL_SALES_DESC: 'Summa av betalda fakturor',
    ACTIVE_LEADS: 'Aktiva Leads',
    ACTIVE_LEADS_DESC: 'Leads som inte är vunna/förlorade',
    ACTIVE_JOBS: 'Pågående Jobb',
    ACTIVE_JOBS_DESC: 'Jobb som pågår',
    OVERDUE_INVOICES: 'Förfallna Fakturor',
    OVERDUE_INVOICES_DESC: 'Fakturor som är förfallna',
    VS_LAST_MONTH: 'vs förra månaden',
} as const;

// =============================================================================
// USER ROLES
// =============================================================================

export const USER_ROLES = {
    ADMIN: 'Administratör',
    SALES: 'Säljare',
    WORKER: 'Medarbetare',
} as const;

/**
 * Get Swedish label for user role
 */
export const getRoleLabel = (role: string): string => {
    const roleMap: Record<string, string> = {
        admin: USER_ROLES.ADMIN,
        sales: USER_ROLES.SALES,
        worker: USER_ROLES.WORKER,
    };
    return roleMap[role] || role;
};

// =============================================================================
// DASHBOARD LABELS
// =============================================================================

export const DASHBOARD = {
    TITLE: 'Dashboard',
    SUBTITLE: 'Översikt av din verksamhet',
    RECENT_ACTIVITY: 'Senaste Aktiviteter',
    JOB_STATUS: 'Jobbstatus',
    LEADS_BY_STATUS: 'Leads per Status',
    SALES_OVERVIEW: 'Försäljningsöversikt',
    QUICK_ACTIONS: 'Snabbåtgärder',
    REFRESH: 'Uppdatera',
    LOADING_ERROR: 'Kunde inte ladda dashboard-data.',
    NO_ACTIVITY: 'Ingen aktivitet att visa',
} as const;

// =============================================================================
// COMMON ACTIONS
// =============================================================================

export const ACTIONS = {
    SAVE: 'Spara',
    CANCEL: 'Avbryt',
    DELETE: 'Ta bort',
    EDIT: 'Redigera',
    CREATE: 'Skapa',
    CLOSE: 'Stäng',
    VIEW: 'Visa',
    SEARCH: 'Sök',
    FILTER: 'Filtrera',
    EXPORT: 'Exportera',
} as const;

// =============================================================================
// SIDEBAR LABELS
// =============================================================================

export const SIDEBAR = {
    EXPAND: 'Expandera sidebar',
    COLLAPSE: 'Kollaps sidebar',
    LOGOUT: 'Logga ut',
    PROFILE: 'Profil',
    ALL_DOCUMENTS: 'Alla dokument',
} as const;

// =============================================================================
// SIMPLE TRANSLATION HOOK
// =============================================================================

/**
 * Simple translation function
 * Can be replaced with i18next or similar in the future
 */
export const t = <T extends Record<string, string>>(
    translations: T,
    key: keyof T
): string => {
    return translations[key] || String(key);
};

/**
 * Use translation hook (for React components)
 */
export const useTranslation = () => {
    return {
        t,
        locale: 'sv-SE',
        greetings: GREETINGS,
        nav: NAV,
        kpi: KPI,
        dashboard: DASHBOARD,
        actions: ACTIONS,
        sidebar: SIDEBAR,
        getRoleLabel,
        getGreeting,
    };
};
