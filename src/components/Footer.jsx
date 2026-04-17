import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="editorial-footer py-5">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="editorial-footer__brand">
              <h4>DesignDen</h4>
              <p>
                A custom clothing marketplace built around designers, material
                choices, and clearer production decisions.
              </p>
              <div className="editorial-footer__socials">
                <a href="#" aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" aria-label="Pinterest">
                  <i className="fab fa-pinterest-p"></i>
                </a>
                <a href="#" aria-label="YouTube">
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-lg-3">
            <div className="editorial-footer__nav">
              <h5>Explore</h5>
              <ul>
                <li>
                  <Link to="/marketplace">Designer directory</Link>
                </li>
                <li>
                  <Link to="/customer/design-studio">Design studio</Link>
                </li>
                <li>
                  <Link to="/shop">Ready-made shop</Link>
                </li>
                <li>
                  <Link to="/signup?role=designer">Join as designer</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="col-sm-6 col-lg-4">
            <div className="editorial-footer__contact">
              <h5>Support</h5>
              <ul>
                <li>
                  <Link to="/security">Security settings</Link>
                </li>
                <li>
                  <Link to="/help">Help and support</Link>
                </li>
                <li>info@designden.com</li>
                <li>IIIT Sri City</li>
                <li>Custom clothing, handled with care.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="editorial-footer__bottom d-flex flex-column flex-md-row justify-content-between gap-2">
          <small className="editorial-footer__meta">
            © 2026 DesignDen. Light-mode editorial system release.
          </small>
          <small className="editorial-footer__meta">
            Built for clearer material choices, calmer checkout, and stronger designer trust.
          </small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
