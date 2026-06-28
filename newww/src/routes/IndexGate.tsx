import Dashboard from './Dashboard';
import LandingPage from './LandingPage';
import { isAuthenticated } from '../lib/auth';

export default function IndexGate() {
    if (!isAuthenticated()) {
        return <LandingPage />;
    }

    return <Dashboard />;
}
