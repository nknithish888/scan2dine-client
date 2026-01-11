# Scan2Dine - Landing Page

A modern, responsive SaaS landing page for Scan2Dine - a QR-based digital restaurant menu platform.

## 🎯 Project Overview

Scan2Dine helps restaurants modernize their menu experience by providing QR code-based digital menus that customers can access instantly on their phones—no app required.

## 📁 Project Structure

```
Scan2Dine/
└── client/
    ├── public/             # Static assets
    ├── src/
    │   ├── components/     # React components
    │   │   ├── Navbar.jsx       # Navigation bar with mobile menu
    │   │   ├── Hero.jsx         # Hero section with phone mockup
    │   │   ├── HowItWorks.jsx   # 3-step process explanation
    │   │   ├── Features.jsx     # 6 key features grid
    │   │   ├── Benefits.jsx     # Value propositions
    │   │   ├── RestaurantOwner.jsx  # Dashboard showcase
    │   │   ├── Pricing.jsx      # 3-tier pricing plans
    │   │   ├── Testimonials.jsx # Customer reviews
    │   │   ├── FAQ.jsx          # Accordion FAQ section
    │   │   ├── CTA.jsx          # Final call-to-action
    │   │   └── Footer.jsx       # Footer with links
    │   ├── App.jsx         # Main app component
    │   ├── main.jsx        # React entry point
    │   └── index.css       # Global styles & design system
    ├── index.html          # HTML with SEO meta tags
    └── package.json        # Dependencies
```

## 🎨 Design System

### Color Palette
- **Primary Orange**: `#FF6B35` - Main brand color
- **Primary Green**: `#4CAF50` - Secondary brand color
- **Neutrals**: Gray scale from 50 to 900
- **Gradients**: Warm gradients combining orange and green

### Typography
- **Headings**: Outfit (700-800 weight)
- **Body**: Inter (400-600 weight)
- **Size Scale**: Responsive clamp() for fluid typography

### Components
- **Buttons**: Primary, Secondary, Outline variants with hover effects
- **Cards**: Rounded corners (1.5rem), shadow on hover, transform on interaction
- **Sections**: Alternating white and gray backgrounds
- **Animations**: Fade in, slide, float, and scale animations

## 🚀 Features

### Sections Included
1. **Hero** - Compelling headline with phone mockup and CTAs
2. **How It Works** - 3-step process with visual flow
3. **Features** - 6 key features in responsive grid
4. **Benefits** - Value propositions for restaurants
5. **Restaurant Owner** - Dashboard preview and capabilities
6. **Pricing** - 3 tiers (Starter, Pro, Enterprise) with billing toggle
7. **Testimonials** - 3 customer reviews with ratings
8. **FAQ** - Interactive accordion with 6 questions
9. **CTA** - Final conversion section
10. **Footer** - Comprehensive footer with links and newsletter

## 🛠️ Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: CSS + TailwindCSS 3
- **Fonts**: Google Fonts (Inter, Outfit)
- **Icons**: Inline SVG
- **Animations**: CSS keyframes

## 📱 Responsive Design

- **Mobile First**: Optimized for all screen sizes
- **Breakpoints**: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **Touch Friendly**: Large tap targets, mobile menu

## ⚡ Performance

- Fast page load with Vite's optimized build
- Lazy loading ready
- Minimal dependencies
- Optimized CSS animations
- SEO-friendly semantic HTML

## 🎯 SEO Optimization

- Semantic HTML5 structure
- Proper heading hierarchy (single H1)
- Meta descriptions and Open Graph tags
- Twitter Card support
- Alt text for images (when added)
- Mobile-friendly viewport
- Schema.org markup ready

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

The dev server runs on `http://localhost:5173` by default.

Changes to components will hot-reload automatically.

## 🎨 Customization

### Update Colors
Edit CSS variables in `src/index.css`:
```css
:root {
  --primary-orange: #FF6B35;
  --primary-green: #4CAF50;
  /* ... other colors */
}
```

### Modify Content
Each component is self-contained. Update text, images, and data directly in the component files.

### Add Sections
1. Create new component in `src/components/`
2. Import and add to `App.jsx`
3. Style using existing design system classes

## 📝 License

This project is proprietary and confidential.

## 👥 Support

For questions or support, contact: support@scan2dine.com

---

Built with ❤️ for modern restaurants
