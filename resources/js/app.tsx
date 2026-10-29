import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

import { AudioProvider } from '@/Contexts/AudioContext';
import { CartProvider } from '@/Contexts/CartContext';
import CartDrawer from '@/Components/CartDrawer';
import GlobalAudioPlayer from '@/Components/GlobalAudioPlayer';
import AdzanAlertModal from '@/Components/AdzanAlertModal';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        const siteSettings = (props.initialPage.props as any)?.site_settings;
        const initialUser = (props.initialPage.props as any)?.auth?.user;

        root.render(
            <AudioProvider initialSettings={siteSettings}>
                <CartProvider initialUser={initialUser}>
                    <App {...props} />
                    <CartDrawer />
                    <GlobalAudioPlayer />
                    <AdzanAlertModal />
                </CartProvider>
            </AudioProvider>
        );
    },
    progress: {
        color: '#ee4d2d',
    },
});
