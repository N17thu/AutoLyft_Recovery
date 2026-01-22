import Home from './pages/Home';
import Tracking from './pages/Tracking';
import Providers from './pages/Providers';
import History from './pages/History';
import Profile from './pages/Profile';
import ProviderDashboard from './pages/ProviderDashboard';
import Welcome from './pages/Welcome';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Tracking": Tracking,
    "Providers": Providers,
    "History": History,
    "Profile": Profile,
    "ProviderDashboard": ProviderDashboard,
    "Welcome": Welcome,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};