import {
    useEffect,
    useRef,
} from 'react'

import { initializeAuthenticatedDappSession } from '../features/auth/startup.ts'
import { ContractLoading } from '../components/ContractLoading'
import { isSplashRoutePath } from '../pages/splash/animation.ts'
import { AppRouter } from '../router/index.ts'
import { useDappStore } from '../stores/dapp/store.ts'

async function initializeAuthenticatedDappSessionAfterOpening(): Promise<void> {
    if (isSplashRoutePath()) {
        return
    }

    await initializeAuthenticatedDappSession()
}

function AuthenticatedDappSessionBootstrap() {
    const hasStartedRef = useRef(false)

    useEffect(() => {
        if (hasStartedRef.current) return

        hasStartedRef.current = true
        void initializeAuthenticatedDappSessionAfterOpening()
    }, [])

    return null
}

function App() {
    const contractPending = useDappStore((state) => state.dappLoading)

    return (
        <>
            <AuthenticatedDappSessionBootstrap />
            <AppRouter />
            <ContractLoading show={contractPending} />
        </>
    )
}

export default App
