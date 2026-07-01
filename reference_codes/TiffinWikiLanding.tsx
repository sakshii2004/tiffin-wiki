import React, { useState } from 'react';

interface IconProps {
  size?: number;
}

interface Tiffin {
  id: number;
  name: string;
  location: string;
  price: string;
  type: 'Pure Veg' | 'Veg / Non-Veg';
  upvotes: number;
  verified: boolean;
  tags: string[];
}

interface Step {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const MapPinIcon = ({ size = 24 }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const PlusIcon = ({ size = 18 }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/><path d="M12 5v14"/>
  </svg>
);

const StarIcon = ({ size = 14 }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="#b85c38" stroke="#b85c38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const ShieldCheckIcon = ({ size = 18 }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
  </svg>
);

const NavigationIcon = ({ size = 14 }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
  </svg>
);

const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b85c38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
  </svg>
);

const CheckCircleIcon = ({ size = 32 }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#3d7a2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

export default function TiffinWikiLanding() {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const trendingTiffins: Tiffin[] = [
    {
      id: 1,
      name: 'Maa Ki Rasoi',
      location: 'Viman Nagar',
      price: '₹90',
      type: 'Pure Veg',
      upvotes: 142,
      verified: true,
      tags: ['Jain Available', 'Lunch & Dinner'],
    },
    {
      id: 2,
      name: 'Asha Aunty Dabba',
      location: 'Kothrud',
      price: '₹110',
      type: 'Veg / Non-Veg',
      upvotes: 89,
      verified: true,
      tags: ['Sunday Special', 'Dinner Only'],
    },
    {
      id: 3,
      name: 'Daily Fresh Bites',
      location: 'Hinjewadi',
      price: '₹80',
      type: 'Pure Veg',
      upvotes: 45,
      verified: false,
      tags: ['Breakfast Available'],
    },
  ];

  const steps: Step[] = [
    { icon: <SearchIcon />, title: '1. Discover', desc: 'Search for unlisted tiffin providers by area, price, and dietary preference.' },
    { icon: <CheckCircleIcon size={32} />, title: '2. Taste & Review', desc: 'Upvote verified numbers, review hygiene, and flag closed services.' },
    { icon: <PlusIcon size={32} />, title: '3. Map the Unlisted', desc: 'Know a great local dabba? Add their details so others can find them.' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', color: '#0f172a' }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e2e8f0',
      }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{ width: 32, height: 32, backgroundColor: '#b85c38', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 20 }}>t</div>
            <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em', color: '#1e293b' }}>tiffin.wiki</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 500, cursor: 'pointer', fontSize: 15 }}>Log in</button>
            <button style={{ backgroundColor: '#b85c38', color: 'white', border: 'none', borderRadius: 999, padding: '8px 18px', fontWeight: 500, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <PlusIcon size={18} /> Add a Tiffin
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '80px 24px 96px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, color: '#0f172a', marginBottom: 20 }}>
            Discover hidden{' '}
            <span style={{ color: '#b85c38' }}>home-cooked</span> meals.
          </h1>
          <p style={{ fontSize: 18, color: '#475569', maxWidth: 520, margin: '0 auto 36px' }}>
            The community-maintained directory of unlisted local tiffin services, rated and reviewed by people like you.
          </p>

          {/* Search bar */}
          <div style={{
            maxWidth: 680, margin: '0 auto 20px',
            backgroundColor: 'white', borderRadius: 999,
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', padding: '6px 6px 6px 20px', gap: 8,
          }}>
            <span style={{ color: '#94a3b8', flexShrink: 0 }}><MapPinIcon size={22} /></span>
            <input
              type="text"
              placeholder="Where do you need food? (e.g. Kothrud)"
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 16, color: '#0f172a', backgroundColor: 'transparent' }}
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
            <div style={{ width: 1, height: 28, backgroundColor: '#e2e8f0', margin: '0 4px', flexShrink: 0 }} />
            <button style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: 999, padding: '10px 22px', fontWeight: 500, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0 }}>
              <SearchIcon /> Find Tiffins
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, fontSize: 13, color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, backgroundColor: 'white', padding: '5px 14px', borderRadius: 999, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
              <NavigationIcon size={14} /> Use my location
            </span>
            <span style={{ padding: '5px 14px', backgroundColor: '#eef5e6', color: '#2d5c10', borderRadius: 999, border: '1px solid #b6d98a', fontWeight: 500 }}>Pure Veg</span>
            <span style={{ padding: '5px 14px', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: 999, border: '1px solid #dbeafe', fontWeight: 500 }}>Lunch / Dinner</span>
          </div>
        </div>
      </section>

      {/* Trending */}
      <section style={{ backgroundColor: 'white', padding: '64px 24px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
              <TrendingUpIcon /> Trending near you
            </h2>
            <a href="#" style={{ color: '#3d7a2a', fontWeight: 500, textDecoration: 'none', fontSize: 14 }}>View all mapped tiffins →</a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {trendingTiffins.map((tiffin: Tiffin) => (
              <div key={tiffin.id} style={{
                backgroundColor: 'white', borderRadius: 16, border: '1px solid #e2e8f0',
                padding: 20, cursor: 'pointer', transition: 'box-shadow 0.2s',
              }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.10)'}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 4px' }}>
                      {tiffin.name}
                      {tiffin.verified && <ShieldCheckIcon size={16} />}
                    </h3>
                    <p style={{ color: '#64748b', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, margin: 0 }}>
                      <MapPinIcon size={13} /> {tiffin.location}
                    </p>
                  </div>
                  <div style={{ backgroundColor: '#fdf3ef', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, color: '#6e3220', fontWeight: 700, fontSize: 13, border: '1px solid #f0c0a8', flexShrink: 0 }}>
                    <StarIcon size={13} /> {tiffin.upvotes}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 5,
                    color: tiffin.type === 'Pure Veg' ? '#2d5c10' : '#b91c1c',
                    backgroundColor: tiffin.type === 'Pure Veg' ? '#eef5e6' : '#f1f5f9',
                  }}>{tiffin.type}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 5, backgroundColor: '#f1f5f9', color: '#475569' }}>
                    ~ {tiffin.price} / meal
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {tiffin.tags.map((tag: string) => (
                    <span key={tag} style={{ fontSize: 11, color: '#64748b', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: 5 }}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section style={{ padding: '64px 24px', backgroundColor: '#0f172a', color: 'white' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Built by the community. For the community.</h2>
            <p style={{ color: '#94a3b8', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
              Tiffin services rarely have websites. We rely on your contributions to keep the local food ecosystem mapped and accurate.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, textAlign: 'center' }}>
            {steps.map((step: Step) => (
              <div key={step.title} style={{ padding: '0 16px' }}>
                <div style={{ width: 64, height: 64, backgroundColor: '#1e293b', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#3d7a2a' }}>
                  {step.icon}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{step.title}</h3>
                <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: 14 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
