import React from 'react';
import '../../styles/pages/TAPHomepage.css';

const TAPHomepage = () => {
  return (
    <div className="tap-homepage">
      <header className="tap-header">
        <div className="logo">LOGO</div>
        <nav className="tap-nav">
        </nav>
      </header>

      <main className="tap-main">
        <section className="tap-intro">
          <h1>TAP - Tactical Action Planning</h1>
          <div className="actions">
            <button className="create-plan-btn">Create Plan</button>
            <div className="disclaimer">Disclaimer About TAP</div>
          </div>
        </section>

        <section className="about-tap">
          <h2>About TAP</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc maximus,
            nulla ut commodo sagittis, sapien dui mattis dui, non pulvinar lorem felis nec erat.
          </p>
          <div className="buttons">
            <button className="get-started-btn">Get Started</button>
            <button className="learn-more-btn">Learn More</button>
          </div>
        </section>

        <section className="pre-created-plans">
          <h2>Explore Pre-Created Plans</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc maximus, nulla ut commodo sagittis,
            sapien dui mattis dui, non pulvinar lorem felis nec erat.
          </p>

          <div className="plans-grid">
            <div className="plan-card">
              <h3>Fitness</h3>
              <p>Lorem ipsum dolor sit amet nulla adipiscing elit. Nunc maximus, nec ut commodo</p>
              <button className="learn-more-btn">Learn More</button>
            </div>

            <div className="plan-card">
              <h3>Meal Prep</h3>
              <p>Lorem ipsum dolor sit amet nulla adipiscing elit. Nunc maximus, nec ut commodo</p>
              <button className="learn-more-btn">Learn More</button>
            </div>

            <div className="plan-card">
              <h3>Interior Design</h3>
              <p>Lorem ipsum dolor sit amet nulla adipiscing elit. Nunc maximus, nec ut commodo</p>
              <button className="learn-more-btn">Learn More</button>
            </div>

            <div className="plan-card">
              <h3>Home Improvement</h3>
              <p>Lorem ipsum dolor sit amet nulla adipiscing elit. Nunc maximus, nec ut commodo</p>
              <button className="learn-more-btn">Learn More</button>
            </div>

            <div className="plan-card">
              <h3>Fashion?</h3>
              <p>Lorem ipsum dolor sit amet nulla adipiscing elit. Nunc maximus, nec ut commodo</p>
              <button className="learn-more-btn">Learn More</button>
            </div>

            <div className="plan-card">
              <h3>Landscaping</h3>
              <p>Lorem ipsum dolor sit amet nulla adipiscing elit. Nunc maximus, nec ut commodo</p>
              <button className="learn-more-btn">Learn More</button>
            </div>

            <div className="plan-card">
              <h3>Coming Soon</h3>
              <p>Lorem ipsum dolor sit amet nulla adipiscing elit. Nunc maximus, nec ut commodo</p>
              <button className="learn-more-btn">Learn More</button>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
};

export default TAPHomepage;
