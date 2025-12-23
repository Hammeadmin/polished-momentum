// UI Component Library
// Standardized, reusable components for consistent design across the CRM

export { default as Button } from './Button';
export { default as Modal } from './Modal';
export { default as Badge } from './Badge';
export { default as Breadcrumbs } from './Breadcrumbs';
export { default as KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
export { default as PageSkeleton } from './PageSkeleton';
export { default as GlobalSearch } from './GlobalSearch';
export { default as FilterBar } from './FilterBar';
export { default as QuickActions, createCommonActions } from './QuickActions';

// Usage examples:
// import { Button, Modal, Badge, Breadcrumbs, KeyboardShortcutsHelp } from './components/ui';
//
// <Button variant="primary" size="md" loading={isLoading}>Save</Button>
// <Button variant="outline" icon={<Plus />}>Add Item</Button>
// <Badge variant="success" dot>Active</Badge>
// <Modal isOpen={show} onClose={() => setShow(false)} title="Edit">...</Modal>
// <Breadcrumbs /> // Auto-generates from route
// <KeyboardShortcutsHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
