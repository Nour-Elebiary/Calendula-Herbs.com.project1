'use client'

const VIDEO_URL = 'https://res.cloudinary.com/dcukpuftg/video/upload/v1782298734/calendula-herbs/videos/hero-about.mp4'
const POSTER_URL = 'https://res.cloudinary.com/dcukpuftg/video/upload/so_1/v1782298734/calendula-herbs/videos/hero-about.jpg'

export function AboutHero() {
  return (
    <section className="about-hero relative overflow-hidden">
      <div className="about-hero__fallback" aria-hidden="true" style={{ '--fallback-img': `url(${POSTER_URL})` } as React.CSSProperties} />
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="about-hero__video"
        poster={POSTER_URL}
        onError={(e) => console.error('[AboutHero] Video failed to load:', VIDEO_URL, e)}
        onCanPlay={() => console.log('[AboutHero] Video ready:', VIDEO_URL)}
      >
        <source
          src={VIDEO_URL}
          type="video/mp4"
        />
      </video>
      <div className="about-hero__overlay" />
      <div className="about-hero__content">
        <h1 className="about-hero__title">About Calendula Herbs</h1>
        <p className="about-hero__description">
          Cultivating purity and delivering excellence for over four decades. We are dedicated to providing the world with the finest organic herbs, rooted in generations of agricultural expertise.
        </p>
      </div>
    </section>
  )
}
