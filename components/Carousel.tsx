"use client";

import React, { useState, useRef, useEffect } from "react";
import Slider from "react-slick";
import { motion, AnimatePresence } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Product interface (expand as needed)
interface Product {
  id: string | number;
  name: string;
  imageUrl: string;
  description?: string;
  price?: number;
  ctaText?: string;
}

interface CarouselProps {
  products: Product[];
  height?: string;
  width?: string;
}

export default function Carousel({
  products,
  height = "500px",
  width = "100%",
}: CarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const sliderRef = useRef<Slider | null>(null);

  // Custom arrow components
  const NextArrow = (props: any) => {
    const { onClick } = props;
    return (
      <motion.button
        className="custom-arrow next-arrow"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        aria-label="Next slide"
      >
        {/* SVG Icon remains the same */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="24"
          height="24"
        >
          <path d="M9.4 18L8 16.6L12.6 12L8 7.4L9.4 6L15.4 12L9.4 18Z" />
        </svg>
      </motion.button>
    );
  };

  const PrevArrow = (props: any) => {
    const { onClick } = props;
    return (
      <motion.button
        className="custom-arrow prev-arrow"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        aria-label="Previous slide"
      >
        {/* SVG Icon remains the same */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="24"
          height="24"
        >
          <path d="M15.4 18L14 16.6L9.4 12L14 7.4L15.4 6L8.4 12L15.4 18Z" />
        </svg>
      </motion.button>
    );
  };

  // Slider settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 700, // Slightly faster transition
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: !isHovering,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    beforeChange: (_: number, next: number) => setCurrentSlide(next),
    customPaging: () => <div className="custom-dot" />,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
        },
      },
    ],
  };

  // Keyboard navigation (remains the same)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        sliderRef.current?.slickPrev();
      } else if (e.key === "ArrowRight") {
        sliderRef.current?.slickNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fallback image (remains the same)
  const fallbackImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23f0f0f0'/%3E%3Ctext x='400' y='200' font-family='Arial' font-size='24' fill='%23888' text-anchor='middle'%3EImage Not Available%3C/text%3E%3C/svg%3E`;

  // Limit displayed products to the first 3
  const displayedProducts = products.slice(0, 3);

  // Animation settings for faster, snappier feel
  const animationProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
    transition: { duration: 0.6 }, // Slightly faster base duration
  };

  const animationDelay = (delay: number) => ({
    ...animationProps,
    transition: { ...animationProps.transition, delay },
  });

  return (
    <>
      <style jsx global>{`
        /* Custom Carousel Styling - Vibrant Theme */
        .carousel-container {
          position: relative;
          overflow: hidden;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2); /* Slightly enhanced shadow */
          border-radius: 12px;
          background: #1a1a1a; /* Dark charcoal instead of pure black */
        }

        .slide-container {
          position: relative;
          overflow: hidden; /* Keep this to contain zoom */
        }

        .slide-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 45px 30px 30px; /* Adjusted padding */
          /* Adjusted gradient: starts strong, fades faster */
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.9) 0%,
            /* Slightly stronger black at bottom */ rgba(0, 0, 0, 0.4) 60%,
            /* Fades faster */ rgba(0, 0, 0, 0) 100%
          );
          color: white;
          z-index: 10;
        }

        .slide-image-container {
          position: relative;
          overflow: hidden; /* Necessary for zoom effect */
        }

        /* Reverted to object-fit: cover to fill space (will crop images) */
        .slide-image {
          display: block; /* Prevents bottom space */
          width: 100%;
          height: 100%;
          object-fit: cover; /* Fills container, potentially cropping */
          /* Faster zoom transition */
          transition: transform 6s ease-out;
        }

        .slide-container:hover .slide-image {
          transform: scale(1.08); /* Slightly larger zoom */
        }

        .slide-title {
          font-weight: 700;
          margin: 0 0 10px; /* Increased bottom margin */
          font-size: clamp(1.7rem, 4.5vw, 2.8rem); /* Slightly larger title */
          line-height: 1.2;
          text-shadow: 0 2px 5px rgba(0, 0, 0, 0.4); /* Stronger shadow */
        }

        .slide-description {
          font-size: clamp(
            0.95rem,
            2vw,
            1.15rem
          ); /* Slightly larger description */
          margin: 0 0 18px;
          opacity: 0.95; /* Slightly more opaque */
          max-width: 85%; /* Allow slightly wider text */
          line-height: 1.55; /* Increased line height */
        }

        .slide-price {
          font-size: 1.4rem; /* Larger price */
          font-weight: 600;
          margin: 15px 0; /* Increased margin */
          color: #ffffff;
        }

        .slide-button {
          display: inline-block;
          padding: 14px 28px; /* Larger button */
          background: rgba(255, 255, 255, 0.95); /* Brighter background */
          color: #111; /* Darker text for contrast */
          font-weight: 700; /* Bolder */
          font-size: 1rem; /* Larger font size */
          border: none;
          border-radius: 8px; /* Slightly larger radius */
          cursor: pointer;
          transition: all 0.25s ease;
          text-transform: uppercase;
          letter-spacing: 0.8px; /* More spacing */
        }

        .slide-button:hover {
          background: #ffffff; /* Solid white on hover */
          transform: translateY(-3px); /* More lift */
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.25); /* Stronger shadow */
        }

        /* Progress bar */
        .progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 5px; /* Thicker bar */
          background: #fff; /* Solid bright white */
          z-index: 20;
        }

        /* Custom Arrows - Styling remains largely the same, ensure contrast */
        .custom-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px; /* Slightly larger arrows */
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.85);
          border-radius: 50%;
          cursor: pointer;
          z-index: 10;
          border: none;
          color: #000;
          opacity: 0.7;
          transition: all 0.3s ease;
        }

        .custom-arrow:hover {
          opacity: 1;
          background: white;
          transform: translateY(-50%) scale(1.05); /* Add subtle scale on hover */
        }

        .next-arrow {
          right: 25px;
        } /* Slightly more inset */
        .prev-arrow {
          left: 25px;
        }

        /* Custom Dots */
        .slick-dots {
          bottom: 20px;
        } /* Raise dots slightly */

        .custom-dot {
          width: 11px; /* Larger dots */
          height: 11px;
          background: rgba(255, 255, 255, 0.35); /* Dimmer inactive dots */
          border-radius: 50%;
          display: inline-block;
          transition: all 0.3s ease;
          margin: 0 6px; /* More space between dots */
        }

        .slick-active .custom-dot {
          background: white; /* Solid white active dot */
          transform: scale(1.25); /* More prominent active dot */
        }

        /* Mobile Optimizations */
        @media (max-width: 768px) {
          .slide-content {
            padding: 35px 20px 25px;
          }
          .slide-description {
            max-width: 100%;
          }
          .slide-title {
            font-size: clamp(1.5rem, 5vw, 2.2rem);
          }
          .custom-arrow {
            display: none;
          } /* Hide arrows on mobile */
        }
      `}</style>

      <div
        className="carousel-container"
        style={{ width, height }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {displayedProducts.length > 0 ? (
          <Slider ref={sliderRef} {...settings}>
            {displayedProducts.map((product, index) => {
              const imagePath = product.imageUrl
                ? `/${product.imageUrl.replace(/^\/+/, "")}`
                : fallbackImage;

              return (
                <div key={product.id} className="slide-container">
                  <div className="slide-image-container" style={{ height }}>
                    <img
                      src={imagePath}
                      alt={product.name}
                      className="slide-image"
                      onError={(e) => {
                        console.error(`Failed to load: ${imagePath}`);
                        (e.target as HTMLImageElement).src = fallbackImage;
                      }}
                    />
                  </div>

                  <AnimatePresence>
                    {currentSlide === index && (
                      <motion.div className="slide-content" {...animationProps}>
                        <motion.h2
                          className="slide-title"
                          {...animationDelay(0.1)}
                        >
                          {product.name}
                        </motion.h2>

                        {product.description && (
                          <motion.p
                            className="slide-description"
                            {...animationDelay(0.2)}
                          >
                            {product.description}
                          </motion.p>
                        )}

                        {product.price && (
                          <motion.div
                            className="slide-price"
                            {...animationDelay(0.3)}
                          >
                            ${product.price.toFixed(2)}
                          </motion.div>
                        )}

                        <motion.button
                          className="slide-button"
                          {...animationDelay(0.4)}
                          whileHover={{
                            scale: 1.05,
                            backgroundColor: "#ffffff",
                            y: -3,
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {product.ctaText || "View Details"}
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Progress bar */}
                  {currentSlide === index && !isHovering && (
                    <motion.div
                      className="progress-bar"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{
                        duration: settings.autoplaySpeed / 1000,
                        ease: "linear",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </Slider>
        ) : (
          <div
            style={{
              height,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
            }}
          >
            No products to display.
          </div>
        )}
      </div>
    </>
  );
}
