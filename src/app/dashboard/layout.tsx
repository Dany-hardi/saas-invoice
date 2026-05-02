import { Sidebar } from '@/components/shared/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main
                style={{
                    flex: 1,
                    background: 'var(--color-bg)',
                    overflowY: 'auto',
                }}
            >
                {children}
            </main>
        </div>
    );
}
