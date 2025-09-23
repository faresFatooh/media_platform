import React, { useState, useEffect, useCallback } from 'react';
import { Theme, Section, Script, FactCheckResult, NotificationMessage, Style, TrainingData, ApiConfigs, ApiStatuses, TrainingExample } from './types';
import { NAV_ITEMS, STYLES } from './constants';
import { getApiConfigs, saveApiConfigs } from './services/apiConfigService';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import NewScriptForm from './components/NewScriptForm';
import Notification from './components/Notification';
import ApiSettings from './components/ApiSettings';
import StyleTraining from './components/ProgramTraining';
import OnThisDay from './components/OnThisDay';

const STYLES_STORAGE_KEY = 'style_platform_data_v2';

const App: React.FC = () => {
    // --- All your existing state hooks remain the same ---
    const [theme, setTheme] = useState<Theme>('light');
    const [activeSection, setActiveSection] = useState<Section>('dashboard');
    const [generatedScript, setGeneratedScript] = useState<Script | null>(null);
    const [factCheckResult, setFactCheckResult] = useState<FactCheckResult | null>(null);
    const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
    const [styles, setStyles] = useState<Style[]>(() => {
        try {
            const storedStyles = localStorage.getItem(STYLES_STORAGE_KEY);
            if (storedStyles) {
                const parsed = JSON.parse(storedStyles);
                // Your validation logic is good and remains here
                if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(style => style.trainingData)) {
                    return parsed;
                }
            }
            return STYLES;
        } catch (error) {
            console.error("Failed to load styles from localStorage", error);
            return STYLES;
        }
    });
    const [apiConfigs, setApiConfigs] = useState<ApiConfigs>({ claudeApiKey: '', chatGptApiKey: '' });
    const [apiStatuses, setApiStatuses] = useState<ApiStatuses>({ claude: 'disconnected', chatGpt: 'disconnected' });

    // --- ✅ 1. ADDED: New state to track authentication ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const addNotification = useCallback((message: string, type: NotificationMessage['type']) => {
        const newNotification = { id: Date.now(), message, type };
        setNotifications(prev => [...prev, newNotification]);
    }, []);

    // --- ✅ 2. ADDED: The "Mailbox" to listen for the token ---
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // IMPORTANT: Replace with your main frontend's URL for security
            if (event.origin !== "https://frontend-rgr7.onrender.com") {
                return;
            }
            if (event.data && event.data.type === 'AUTH_TOKEN') {
                console.log('Auth token received by discovery-script-service!');
                localStorage.setItem('access_token', event.data.token);
                setIsAuthenticated(true); // Signal that we are now authenticated
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);


    // --- ✅ 3. MODIFIED: This now waits for authentication before running ---
    useEffect(() => {
        const loadConfigs = async () => {
            addNotification('جاري تحميل إعدادات API...', 'info');
            try {
                const savedConfigs = await getApiConfigs();
                setApiConfigs(savedConfigs);
                addNotification('تم تحميل الإعدادات بنجاح', 'success');
            } catch (err) {
                console.error("Failed to load configs:", err);
                addNotification('فشل تحميل الإعدادات من الخادم', 'error');
            }
        };

        if (isAuthenticated) {
            loadConfigs();
        }
    }, [isAuthenticated, addNotification]); // Depends on isAuthenticated now

    const handleSaveApiSettings = async (configs: ApiConfigs) => {
        addNotification('جاري حفظ الإعدادات...', 'info');
        try {
            await saveApiConfigs(configs);
            addNotification('تم حفظ الإعدادات بنجاح.', 'success');
            setApiConfigs(configs);
        } catch (e) {
            addNotification('فشل حفظ الإعدادات.', 'error');
        }
    };
    
    // ... The rest of your functions and useEffects remain unchanged ...
    useEffect(() => {
        const root = window.document.documentElement;
        const body = window.document.body;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
        body.classList.remove(theme === 'light' ? 'bg-bg-primary-dark' : 'bg-bg-primary-light');
        body.classList.add(theme === 'light' ? 'bg-bg-primary-light' : 'bg-bg-primary-dark');
    }, [theme]);
    
    useEffect(() => {
        try {
            localStorage.setItem(STYLES_STORAGE_KEY, JSON.stringify(styles));
        } catch (error) {
            console.error("Failed to save styles to localStorage", error);
        }
    }, [styles]);
    
    const handleSectionChange = (section: Section) => {
        if (section === 'factCheck' && !generatedScript) {
            addNotification('الرجاء توليد نص أولاً لتدقيق الحقائق', 'warning');
            return;
        }
        setActiveSection(section);
    };

    // ... All your other handler functions (handleScriptGenerated, handleAddStyle, etc.) remain here ...
    const handleScriptGenerated = (script: Script) => { setGeneratedScript(script); /* ... */ };
    const handleFactCheckComplete = (result: FactCheckResult) => { setFactCheckResult(result); /* ... */ };
    const handleGenerateFromEvent = (title: string) => { /* ... */ };
    const handleAddStyle = (newStyle: Omit<Style, 'id' | 'scriptCount' | 'trainingData'>) => { /* ... */ };
    const handleUpdateStyleTraining = (styleId: string, trainingData: TrainingData) => { /* ... */ };
    const handleAddToTraining = (styleId: string, originalContent: string, editedContent: string) => { /* ... */ };


    const renderSection = () => {
        // ✅ 4. ADDED: A loading state while waiting for the token
        if (!isAuthenticated) {
            return (
                <div className="text-center p-12 bg-card-bg-light dark:bg-card-bg-dark rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">جاري المصادقة...</h2>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2">
                        إذا استمرت هذه الرسالة، يرجى إعادة تحميل لوحة التحكم الرئيسية والمحاولة مرة أخرى.
                    </p>
                </div>
            );
        }

        switch (activeSection) {
            case 'dashboard':
                return <Dashboard styles={styles} onAddStyle={handleAddStyle} onSelectStyle={(styleName: string) => setActiveSection('newScript')} />;
            case 'newScript':
                // ... your existing case ...
                return <div>New Script Form</div>;
            case 'api':
                // Pass the loaded configs to the component
                return <ApiSettings addNotification={addNotification} />;
            // ... all other cases remain the same ...
            default:
                return <Dashboard styles={styles} onAddStyle={handleAddStyle} onSelectStyle={() => setActiveSection('newScript')} />;
        }
    };

    return (
        <div className={`min-h-screen bg-bg-primary-light dark:bg-bg-primary-dark text-text-primary-light dark:text-text-primary-dark font-sans transition-colors duration-300`}>
            <Header theme={theme} setTheme={setTheme} />
            <Navigation activeSection={activeSection} setActiveSection={handleSectionChange} />
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {renderSection()}
            </main>
            <div className="fixed top-5 left-1-2 -translate-x-1-2 z-50 w-full max-w-sm">
                {notifications.map(notification => (
                    <Notification
                        key={notification.id}
                        message={notification.message}
                        type={notification.type}
                        onDismiss={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                    />
                ))}
            </div>
        </div>
    );
};

export default App;