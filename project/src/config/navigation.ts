/**
 * Centralized Navigation Configuration
 * Extracted from Sidebar.tsx for better maintainability
 */
import { LucideIcon } from 'lucide-react';
import {
    Home,
    Users,
    FileText,
    Package,
    Calendar,
    Receipt,
    Users2,
    Settings,
    BarChart3,
    MessageSquare,
    DollarSign,
    FolderOpen,
    TrainFrontTunnel,
    Newspaper
} from 'lucide-react';

export interface NavigationSubItem {
    name: string;
    href: string;
}

export interface NavigationItem {
    name: string;
    href: string;
    icon: LucideIcon;
    shortcut?: string;
    submenu?: NavigationSubItem[];
}

export const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/', icon: Home, shortcut: 'G+D' },
    { name: 'Säljtunnel', href: '/Säljtunnel', icon: TrainFrontTunnel, shortcut: 'G+O' },
    { name: 'Orderhantering', href: '/Orderhantering', icon: Package, shortcut: 'G+O' },
    { name: 'Kunder', href: '/kunder', icon: Users, shortcut: 'G+K' },
    { name: 'Offerter', href: '/offerter', icon: FileText, shortcut: 'G+F' },
    { name: 'Förfrågningar', href: '/leads', icon: Users, shortcut: 'G+L' },
    { name: 'Kalender', href: '/kalender', icon: Calendar, shortcut: 'G+C' },
    { name: 'Fakturor', href: '/fakturor', icon: Receipt, shortcut: 'G+I' },
    { name: 'Kommunikation', href: '/kommunikation', icon: MessageSquare, shortcut: 'G+M' },
    { name: 'Team', href: '/team', icon: Users2, shortcut: 'G+T' },
    { name: 'Lönehantering', href: '/lonehantering', icon: DollarSign, shortcut: 'G+P' },
    {
        name: 'Dokument',
        href: '/dokument',
        icon: FolderOpen,
        shortcut: 'G+D',
        submenu: [
            { name: 'Alla dokument', href: '/dokument' },
            { name: 'Rapporter', href: '/rapporter' }
        ]
    },
    { name: 'Intranät', href: '/intranat', icon: Newspaper, shortcut: 'G+N' },
    { name: 'Analys', href: '/analys', icon: BarChart3, shortcut: 'G+A' },
    { name: 'Inställningar', href: '/installningar', icon: Settings, shortcut: 'G+S' }
];

// Organization list (can be fetched from API in future)
export interface Organization {
    id: string;
    name: string;
    current: boolean;
}

export const defaultOrganizations: Organization[] = [
    { id: '1', name: 'Momentum AB', current: true },
    { id: '2', name: 'Acme Solutions', current: false },
    { id: '3', name: 'Nordic Tech', current: false }
];
