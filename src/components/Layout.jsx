import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import FlashMessages from "./FlashMessages";

const Layout = ({ children }) => {
  const location = useLocation();
  const isFullScreenPage =
    location.pathname === "/" ||
    location.pathname.startsWith("/shop") ||
    location.pathname.startsWith("/marketplace") ||
    location.pathname.startsWith("/customer/design-studio");

  return (
    <>
      <Header />
      <FlashMessages />
      {isFullScreenPage ? (
        children
      ) : (
        <div className="container editorial-page-shell my-4">{children}</div>
      )}
      <Footer />
    </>
  );
};

export default Layout;
