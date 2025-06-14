import logo from '../assets/logo.png';
import '../App.css';

function Header() {
    return (
        <header className="site-header">
            <img src={logo} alt="Site Logo" className="header-logo" />
        </header>
    );
}

export default Header;