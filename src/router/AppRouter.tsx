import { useEffect } from 'react'
import {
    Navigate,
    Outlet,
    Route,
    Routes,
    useNavigate,
} from 'react-router'

import { PagePullRefresh } from '@/components/PagePullRefresh'
import { APP_CONFIG } from '@/config/index.ts'
import { AuthSessionBoundary } from '@/features/auth/AuthSessionBoundary.tsx'
import { LoginPage } from '@/pages/auth/index.ts'
import {
    ActivationCardPage,
    AssetPage,
    HomePage,
    InvitePage,
    MainLayout,
    ReservationPage,
    TeamPage,
    UserPage,
} from '@/pages/main'
import { SplashPage } from '@/pages/splash/SplashPage.tsx'
import { SHOWCASE_ROUTE_ELEMENTS } from '@/showcase/router/index.ts'
import { useUserStore } from '@/stores/user/store.ts'

import { AppBrowserRouter } from './AppBrowserRouter.tsx'
import { registerAppRouteReplacer } from './bridge.ts'
import { ROUTE_PATH } from './routes.ts'

function RouterNavigationBridge() {
    const navigate = useNavigate()

    useEffect(() => registerAppRouteReplacer((path) => {
        void navigate(path, { replace: true })
    }), [navigate])

    return null
}

function RequireAuthentication() {
    const isAuthenticated = useUserStore((state) => state.isAuthenticated)
    const isSessionReady = useUserStore((state) => state.isSessionReady)

    if (!isAuthenticated) {
        return <Navigate to={ROUTE_PATH.root} replace />
    }

    return <AuthSessionBoundary ready={isSessionReady}><Outlet /></AuthSessionBoundary>
}

function PullRefreshRouteOutlet() {
    return (
        <PagePullRefresh>
            <Outlet />
        </PagePullRefresh>
    )
}

export function AppRouter() {
    return (
        <AppBrowserRouter>
            <RouterNavigationBridge />
            <Routes>
                <Route path={ROUTE_PATH.root} element={APP_CONFIG.enableStaticPageMode ? <Navigate to={ROUTE_PATH.home} replace /> : <SplashPage />} />
                <Route path={ROUTE_PATH.referral} element={<SplashPage />} />
                <Route path={ROUTE_PATH.login} element={APP_CONFIG.enableStaticPageMode ? <Navigate to={ROUTE_PATH.home} replace /> : <LoginPage />} />

                <Route element={<RequireAuthentication />}>
                    <Route element={<PullRefreshRouteOutlet />}>
                        <Route element={<MainLayout />}>
                            <Route path={ROUTE_PATH.home.slice(1)} element={<HomePage />} />
                            <Route path={ROUTE_PATH.reservation.slice(1)} element={<ReservationPage />} />
                            <Route path={ROUTE_PATH.activationCard.slice(1)} element={<ActivationCardPage />} />
                            <Route path={ROUTE_PATH.asset.slice(1)} element={<AssetPage />} />
                            <Route path={ROUTE_PATH.team.slice(1)} element={<TeamPage />} />
                            <Route path={ROUTE_PATH.invite.slice(1)} element={<InvitePage />} />
                            <Route path={ROUTE_PATH.user.slice(1)} element={<UserPage />} />
                        </Route>
                    </Route>
                </Route>

                {SHOWCASE_ROUTE_ELEMENTS}

                <Route path="*" element={<Navigate to={ROUTE_PATH.root} replace />} />
            </Routes>
        </AppBrowserRouter>
    )
}
