import styles from "./contact.module.css";
function Contact() {
  return (
    <div className={styles.container}>
      <div className={styles.contact}>
        <h3 className={styles.contactTitle}>Contact</h3>
        <p className={styles.contactDesc}>
          Sales • Repairs • Custom Builds
          <br />
          Operated by <strong>Robe</strong>, usually replies within 24–48 hours.
          <br />
          For school project purpose only! demo products.
        </p>

        <div className={styles.contactGrid}>
          <a
            className={styles.contactBtn}
            href="mailto:robeizagani@gmail.com?subject=Order%20Inquiry&body=Hi%20Admin%2C%0A%0AI%27m%20interested%20in%20your%20products.%20Please%20advise%20pricing%20and%20availability."
            target="_blank"
            rel="noopener noreferrer"
          >
            Email
            <span className={styles.contactSub}>robeizagani@gmail.com</span>
          </a>

          <a
            className={styles.contactBtn}
            href="https://mail.google.com/mail/?view=cm&fs=1&to=robeizagani@gmail.com&su=Order%20Inquiry&body=Hi%20Admin%2C%0A%0AI%27m%20interested%20in%20your%20products."
            target="_blank"
            rel="noopener noreferrer"
          >
            Compose in Gmail
            <span className={styles.contactSub}>open gmail</span>
          </a>

          <a className={styles.contactBtn} href="tel:09987654321">
            Call
            <span className={styles.contactSub}>09987654321</span>
          </a>

          <a
            className={styles.contactBtn}
            href="https://wa.me/639998765432?text=Hi%2C%20I%27m%20inquiring%20about%20a%20product"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
            <span className={styles.contactSub}>Chat now</span>
          </a>

          <a
            className={styles.contactBtn}
            href="https://www.facebook.com/Robe.Farol"
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
            <span className={styles.contactSub}>/Robe.Farol</span>
          </a>
          {/* <button
            type="button"
            onClick={() => nav("/login-admin")}
            className={styles.contactBtn}
          >
            Login Admin
          </button> */}
        </div>

        <div className={styles.contactFooterRow}>
          <small className={styles.contactNote}>
            Pickup: San Miguel, Sto. Tomas, Batangas · Hours: Mon–Sat
            10:00–19:00
          </small>
          <small className={styles.contactCredit}>
            Operated & developed by Farol, Roberto Jr.
          </small>
        </div>
      </div>
    </div>
  );
}

export default Contact;
