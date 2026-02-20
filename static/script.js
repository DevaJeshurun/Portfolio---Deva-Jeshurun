// ==================== CANVAS CURSOR (Cursify-style) ====================

(function initCanvasCursor() {
  if (window.innerWidth <= 768) return; // skip on mobile

  const canvas = document.getElementById('cursorCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Particle pool
  const particles = [];
  const PARTICLE_COUNT = 35;
  const TRAIL_DECAY    = 0.04;  // how fast each particle fades
  const DOT_SIZE       = 4;     // max radius of trail dot

  let mouse = { x: -200, y: -200 };
  let isMoving = false;
  let moveTimer;

  // Dot cursor follower state
  const dot = { x: -200, y: -200 };
  const ring = { x: -200, y: -200 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    isMoving = true;
    clearTimeout(moveTimer);
    moveTimer = setTimeout(() => { isMoving = false; }, 150);

    // Spawn a new trail particle
    particles.push({
      x:     e.clientX,
      y:     e.clientY,
      alpha: 0.7,
      size:  DOT_SIZE * (0.5 + Math.random() * 0.5),
      vx:    (Math.random() - 0.5) * 0.8,
      vy:    (Math.random() - 0.5) * 0.8,
    });

    // Keep pool size bounded
    if (particles.length > PARTICLE_COUNT) {
      particles.shift();
    }
  });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Smooth dot follows cursor precisely
    dot.x = lerp(dot.x, mouse.x, 0.9);
    dot.y = lerp(dot.y, mouse.y, 0.9);

    // Ring lags a little
    ring.x = lerp(ring.x, mouse.x, 0.12);
    ring.y = lerp(ring.y, mouse.y, 0.12);

    // Draw trail particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.alpha -= TRAIL_DECAY;
      p.x += p.vx;
      p.y += p.vy;
      p.size *= 0.97;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(p.size, 0.1), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.6})`;
      ctx.fill();
    }

    // Draw outer ring
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, 18, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, 0.35)`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw inner solid dot
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    requestAnimationFrame(draw);
  }

  draw();
})();


// ==================== NAVIGATION FUNCTIONALITY ====================

const navbar            = document.getElementById('navbar');
const mobileMenuToggle  = document.getElementById('mobileMenuToggle');
const navMenu           = document.getElementById('navMenu');
const navLinks          = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 100);
});

mobileMenuToggle.addEventListener('click', () => {
  mobileMenuToggle.classList.toggle('active');
  navMenu.classList.toggle('active');
  document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenuToggle.classList.remove('active');
    navMenu.classList.remove('active');
    document.body.style.overflow = '';
  });
});

// Active link on scroll
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  const scrollY = window.pageYOffset;
  sections.forEach(section => {
    const top = section.offsetTop - 100;
    const id  = section.getAttribute('id');
    if (scrollY > top && scrollY <= top + section.offsetHeight) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) link.classList.add('active');
      });
    }
  });
});

// ==================== SMOOTH SCROLL ====================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    }
  });
});

// ==================== SCROLL ANIMATIONS ====================

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ==================== RESUME DOWNLOAD ====================

const downloadResumeBtn = document.getElementById('downloadResume');

downloadResumeBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  const originalText = downloadResumeBtn.innerHTML;
  downloadResumeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
  downloadResumeBtn.style.pointerEvents = 'none';

  try {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(generateResumeHTML());
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); printWindow.close(); };

    setTimeout(() => {
      downloadResumeBtn.innerHTML = '<i class="fas fa-check"></i> Opening Print Dialog';
      setTimeout(() => {
        downloadResumeBtn.innerHTML = originalText;
        downloadResumeBtn.style.pointerEvents = 'auto';
      }, 2000);
    }, 500);
  } catch (error) {
    downloadResumeBtn.innerHTML = '<i class="fas fa-times"></i> Error';
    setTimeout(() => {
      downloadResumeBtn.innerHTML = originalText;
      downloadResumeBtn.style.pointerEvents = 'auto';
    }, 2000);
  }
});

function generateResumeHTML() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Deva Jeshurun - Resume</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Arial',sans-serif; line-height:1.6; color:#333; max-width:800px; margin:0 auto; padding:40px; background:#fff; }
        header { text-align:center; margin-bottom:30px; border-bottom:3px solid #000; padding-bottom:20px; }
        h1 { font-size:2.5rem; color:#000; margin-bottom:10px; }
        .subtitle { font-size:1.2rem; color:#666; margin-bottom:15px; }
        .contact-info { display:flex; justify-content:center; gap:20px; flex-wrap:wrap; font-size:0.9rem; color:#555; }
        .contact-info a { color:#000; text-decoration:none; }
        section { margin-bottom:30px; }
        h2 { font-size:1.5rem; color:#000; border-left:4px solid #000; padding-left:15px; margin-bottom:15px; }
        .skills-container { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:15px; }
        .skill { background:#f0f0f0; padding:5px 15px; border-radius:15px; font-size:0.9rem; }
        .experience-item, .project-item { margin-bottom:20px; }
        h3 { font-size:1.2rem; color:#000; margin-bottom:5px; }
        .date { font-weight:bold; font-size:0.9rem; margin-bottom:5px; }
        .company { color:#666; font-style:italic; margin-bottom:10px; }
        ul { margin-left:20px; }
        li { margin-bottom:5px; }
        @media print { body { padding:20px; } }
      </style>
    </head>
    <body>
      <header>
        <h1>DEVA JESHURUN D C</h1>
        <div class="subtitle">Aspiring Java Developer | Computer Science Engineer</div>
        <div class="contact-info">
          <span>Chennai, Tamil Nadu, India</span>
          <span>•</span>
          <a href="https://github.com/DevaJeshurun">github.com/DevaJeshurun</a>
          <span>•</span>
          <a href="https://linkedin.com/in/deva-jeshurun-aa493a306">LinkedIn</a>
          <span>•</span>
          <a href="https://leetcode.com/u/deva_jeshurun/">LeetCode</a>
        </div>
      </header>
      <section>
        <h2>Professional Summary</h2>
        <p>Computer Science Engineering student specializing in Java Development, Backend Systems, and Full Stack Web Technologies. Experienced in building scalable applications with modern frameworks.</p>
      </section>
      <section>
        <h2>Technical Skills</h2>
        <div><strong>Languages:</strong><div class="skills-container"><span class="skill">Java</span><span class="skill">Python</span><span class="skill">JavaScript</span></div></div>
        <div><strong>Web:</strong><div class="skills-container"><span class="skill">HTML5</span><span class="skill">CSS3</span><span class="skill">Flask</span><span class="skill">Spring Boot</span></div></div>
        <div><strong>Databases:</strong><div class="skills-container"><span class="skill">MySQL</span><span class="skill">MongoDB</span></div></div>
        <div><strong>Tools:</strong><div class="skills-container"><span class="skill">Docker</span><span class="skill">Git</span><span class="skill">Flutter</span></div></div>
      </section>
      <section>
        <h2>Experience</h2>
        <div class="experience-item">
          <h3>MERN Full Stack Developer</h3>
          <div class="company">Altruisty Innovation Pvt Ltd.</div>
          <div class="date">Apr 2025 – Jun 2025</div>
          <ul><li>Developed responsive web modules with REST API integration</li><li>Handled database operations and full-stack MERN workflows</li></ul>
        </div>
        <div class="experience-item">
          <h3>Python Full Stack Developer</h3>
          <div class="company">Wibits Web Solutions LLP</div>
          <div class="date">Jun 2025 – Jul 2025</div>
          <ul><li>Developed responsive web modules with seamless API integration</li><li>Managed database operations and full-stack workflows</li></ul>
        </div>
        <div class="experience-item">
          <h3>Python Backend Developer Intern</h3>
          <div class="company">Infosys</div>
          <div class="date">Sep 2025 – Nov 2025</div>
          <ul><li>Developed backend systems with multithreading for efficient data processing</li><li>Implemented rule-based processing engines for large-scale operations</li></ul>
        </div>
      </section>
      <section>
        <h2>Projects</h2>
        <div class="project-item"><h3>Parallel Text Handling Processor</h3><div class="date">Python, Multithreading, Streamlit</div><ul><li>Multi-threaded system for batch text processing with analytics dashboard</li></ul></div>
        <div class="project-item"><h3>NutriQuest</h3><div class="date">Flutter, JSON, API Integration</div><ul><li>Mobile nutrition tracking app with barcode scanning and health calculations</li></ul></div>
      </section>
      <section>
        <h2>Certifications</h2>
        <ul>
          <li><strong>Python Foundation Certification</strong> – Infosys Springboard (2025)</li>
          <li><strong>Java Foundation Certification</strong> – Infosys Springboard (2026)</li>
          <li><strong>Java Developer Certification</strong> – Infosys Springboard (2026)</li>
          <li><strong>Acquiring Data</strong> – nasscom (2023)</li>
        </ul>
      </section>
    </body>
    </html>
  `;
}

// ==================== CONTACT FORM — sends to Flask backend ====================
// Flask backend URL — update this if you deploy to a server/different port
const FLASK_API_URL = 'http://localhost:5000/send-email';

const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = contactForm.querySelector('.submit-btn');
  const originalBtnContent = submitBtn.innerHTML;

  const formData = {
    name:    document.getElementById('name').value.trim(),
    email:   document.getElementById('email').value.trim(),
    subject: document.getElementById('subject').value.trim(),
    message: document.getElementById('message').value.trim(),
  };

  if (!formData.name || !formData.email || !formData.subject || !formData.message) {
    showNotification('Please fill in all fields', 'error');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    showNotification('Please enter a valid email address', 'error');
    return;
  }

  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  submitBtn.disabled = true;

  try {
    const response = await fetch(FLASK_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
      showNotification('Thank you! Your message has been sent successfully.', 'success');
      contactForm.reset();
    } else {
      throw new Error(result.error || 'Server error');
    }
  } catch (error) {
    console.error('Error sending message:', error);
    submitBtn.innerHTML = '<i class="fas fa-times"></i> Error';
    showNotification(
      error.message.includes('fetch') 
        ? 'Could not reach the server. Make sure the Flask backend is running.' 
        : 'Something went wrong. Please try again.',
      'error'
    );
  } finally {
    setTimeout(() => {
      submitBtn.innerHTML = originalBtnContent;
      submitBtn.disabled = false;
    }, 3000);
  }
});

// ==================== NOTIFICATION SYSTEM ====================

function showNotification(message, type = 'info') {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 30px;
    background: #151520;
    border: 2px solid #ffffff;
    padding: 20px 25px;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideInRight 0.4s ease;
    max-width: 400px;
    display: flex;
    align-items: center;
    gap: 12px;
    color: #ffffff;
    font-family: 'DM Sans', sans-serif;
  `;

  const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
  notification.innerHTML = `<i class="fas fa-${icon}" style="font-size:1.3rem;"></i><span>${message}</span>`;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.4s ease forwards';
    setTimeout(() => notification.remove(), 400);
  }, 5000);
}

// ==================== PARALLAX SCROLL ====================

window.addEventListener('scroll', () => {
  const heroBackground = document.querySelector('.hero-background');
  if (heroBackground) heroBackground.style.transform = `translateY(${window.pageYOffset * 0.5}px)`;
});

// ==================== PAGE LOAD ====================

window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '1';
  }, 100);
});

console.log('%c🚀 Portfolio Loaded Successfully! ', 'background:#ffffff;color:#000;font-size:16px;padding:10px;border-radius:5px;font-weight:bold;');
console.log('%cDeveloped by Deva Jeshurun', 'color:#ffffff;font-size:12px;');