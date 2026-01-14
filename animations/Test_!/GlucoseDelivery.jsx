import React, { useState, useEffect, useRef, useCallback } from 'react';

const GlucoseDelivery = () => {
  const canvasRef = useRef(null);
  const glucoseCubesRef = useRef([]);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [showStartOverlay, setShowStartOverlay] = useState(true);
  const [timestamp, setTimestamp] = useState('0:00');
  const [alarmsActive, setAlarmsActive] = useState(false);
  const [alarmBannerActive, setAlarmBannerActive] = useState(false);
  const [doorsOpen, setDoorsOpen] = useState(false);
  const [pressureMeterVisible, setPressureMeterVisible] = useState(false);
  const [pressure, setPressure] = useState(0);
  const [wallsShaking, setWallsShaking] = useState(false);
  const [visibleCracks, setVisibleCracks] = useState({ crack1: false, crack2: false, crack3: false, crack4: false });
  const [dialogueVisible, setDialogueVisible] = useState(false);
  const [dialogueText, setDialogueText] = useState('');
  const [spawnRate, setSpawnRate] = useState(0);
  
  const spawnRateRef = useRef(0);
  const animationStartTimeRef = useRef(0);

  // Glucose Cube class
  class GlucoseCube {
    constructor(x, y, canvasHeight, canvasWidth) {
      this.x = x;
      this.y = y;
      this.canvasWidth = canvasWidth;
      this.size = Math.random() * 15 + 10;
      this.speedX = (Math.random() - 0.5) * 3;
      this.speedY = Math.random() * 4 + 2;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.1;
      this.glow = Math.random() * 0.5 + 0.5;
      this.glowDirection = Math.random() > 0.5 ? 1 : -1;
      this.settled = false;
      this.settledY = canvasHeight * 0.6 + Math.random() * canvasHeight * 0.35;
    }

    update() {
      if (!this.settled) {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        if (this.y > this.settledY) {
          this.speedY *= 0.9;
          this.speedX *= 0.95;
          if (Math.abs(this.speedY) < 0.1) {
            this.settled = true;
          }
        }

        if (this.x < 80 || this.x > this.canvasWidth - 80) {
          this.speedX *= -0.8;
          this.x = Math.max(80, Math.min(this.canvasWidth - 80, this.x));
        }
      }

      this.glow += 0.02 * this.glowDirection;
      if (this.glow > 1 || this.glow < 0.5) {
        this.glowDirection *= -1;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);

      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 2);
      gradient.addColorStop(0, `rgba(255, 200, 50, ${this.glow * 0.3})`);
      gradient.addColorStop(1, 'rgba(255, 200, 50, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(-this.size * 2, -this.size * 2, this.size * 4, this.size * 4);

      ctx.fillStyle = `rgba(255, 200, 50, ${this.glow})`;
      ctx.shadowColor = '#ffcc00';
      ctx.shadowBlur = 15;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);

      ctx.fillStyle = `rgba(255, 255, 200, ${this.glow * 0.5})`;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size / 3, this.size / 3);

      ctx.restore();
    }
  }

  // Play alarm sound
  const playAlarmSound = useCallback(() => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();

      const beep = () => {
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'square';

        gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.3);

        oscillator.start(audioContextRef.current.currentTime);
        oscillator.stop(audioContextRef.current.currentTime + 0.3);
      };

      beep();
      setTimeout(beep, 500);
      setTimeout(beep, 1000);
      setTimeout(beep, 1500);
    } catch (e) {
      console.log('Audio not supported');
    }
  }, []);

  // Show dialogue helper
  const showDialogue = useCallback((text) => {
    setDialogueText(text);
    setDialogueVisible(true);
  }, []);

  // Start animation
  const startAnimation = useCallback(() => {
    setIsAnimating(true);
    setShowStartOverlay(false);
    animationStartTimeRef.current = Date.now();
    glucoseCubesRef.current = [];

    // Timeline events
    const timeline = [
      { time: 0, action: () => setTimestamp('0:00') },
      {
        time: 2000,
        action: () => {
          setAlarmsActive(true);
          setAlarmBannerActive(true);
          playAlarmSound();
        }
      },
      {
        time: 4000,
        action: () => {
          setDoorsOpen(true);
          setAlarmBannerActive(false);
          setTimestamp('0:04');
        }
      },
      {
        time: 6000,
        action: () => {
          spawnRateRef.current = 3;
          setSpawnRate(3);
          setPressureMeterVisible(true);
          setTimestamp('0:06');
        }
      },
      {
        time: 8000,
        action: () => {
          spawnRateRef.current = 6;
          setSpawnRate(6);
          setPressure(20);
          setTimestamp('0:08');
        }
      },
      {
        time: 10000,
        action: () => {
          spawnRateRef.current = 10;
          setSpawnRate(10);
          setPressure(40);
          setTimestamp('0:10');
        }
      },
      {
        time: 12000,
        action: () => {
          spawnRateRef.current = 15;
          setSpawnRate(15);
          setPressure(60);
          setTimestamp('0:12');
        }
      },
      {
        time: 15000,
        action: () => {
          setWallsShaking(true);
          spawnRateRef.current = 12;
          setSpawnRate(12);
          setPressure(75);
          setTimestamp('0:15');
        }
      },
      {
        time: 18000,
        action: () => {
          setVisibleCracks(prev => ({ ...prev, crack1: true, crack3: true }));
          setPressure(85);
          setTimestamp('0:18');
        }
      },
      {
        time: 20000,
        action: () => {
          setVisibleCracks(prev => ({ ...prev, crack2: true, crack4: true }));
          setPressure(95);
          setTimestamp('0:20');
        }
      },
      {
        time: 22000,
        action: () => {
          spawnRateRef.current = 5;
          setSpawnRate(5);
          showDialogue("\"The system is <span class='highlight'>flooded</span>. Pressure is <span class='highlight'>critical</span>. If we don't move this cargo, the whole structure <span class='highlight'>collapses</span>.\"");
          setTimestamp('0:22');
        }
      },
      {
        time: 28000,
        action: () => {
          spawnRateRef.current = 2;
          setSpawnRate(2);
          setTimestamp('0:28');
        }
      },
      {
        time: 30000,
        action: () => {
          spawnRateRef.current = 0;
          setSpawnRate(0);
          setTimestamp('0:30');
          setTimeout(() => {
            showDialogue("SCENE 1 COMPLETE<br><span style='font-size: 1rem; opacity: 0.7;'>To be continued...</span>");
          }, 1000);
        }
      }
    ];

    timeline.forEach(event => {
      setTimeout(event.action, event.time);
    });
  }, [playAlarmSound, showDialogue]);

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isAnimating && spawnRateRef.current > 0) {
        // Use __frameProgress for elapsed time when in frame-based mode
        const elapsed = window.__frameProgress !== undefined ? window.__frameProgress : (Date.now() - animationStartTimeRef.current);

        if (elapsed > 3000) {
          for (let i = 0; i < spawnRateRef.current; i++) {
            const x = canvas.width / 2 + (Math.random() - 0.5) * 200;
            const y = canvas.height * 0.1 + 300;
            glucoseCubesRef.current.push(new GlucoseCube(x, y, canvas.height, canvas.width));
          }
        }
      }

      glucoseCubesRef.current.forEach(cube => {
        cube.update();
        cube.draw(ctx);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAnimating]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !isAnimating) {
        startAnimation();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isAnimating, startAnimation]);

  // Get pressure fill color
  const getPressureFillStyle = () => {
    if (pressure > 80) {
      return 'linear-gradient(180deg, #ff0000 0%, #ff3300 100%)';
    } else if (pressure > 50) {
      return 'linear-gradient(180deg, #ff3300 0%, #ff6600 50%, #ffcc00 100%)';
    }
    return 'linear-gradient(180deg, #ff0000 0%, #ff6600 50%, #ffcc00 100%)';
  };

  return (
    <div style={styles.sceneContainer}>
      <div style={styles.stomachSector} />
      <div style={styles.gridOverlay} />

      {/* Alarm Lights */}
      <div style={{ ...styles.alarmLight, ...styles.alarmLightLeft, ...(alarmsActive ? styles.alarmLightActive : {}) }} />
      <div style={{ ...styles.alarmLight, ...styles.alarmLightRight, ...(alarmsActive ? styles.alarmLightActive : {}) }} />

      {/* Bay Doors */}
      <div style={styles.bayDoorContainer}>
        <div style={styles.bayDoorFrame} />
        <div style={{ ...styles.bayDoor, ...styles.bayDoorLeft, ...(doorsOpen ? styles.bayDoorLeftOpen : {}) }}>
          <div style={{ ...styles.bayDoorStripe, top: '10%' }} />
          <div style={{ ...styles.bayDoorStripe, bottom: '10%' }} />
        </div>
        <div style={{ ...styles.bayDoor, ...styles.bayDoorRight, ...(doorsOpen ? styles.bayDoorRightOpen : {}) }}>
          <div style={{ ...styles.bayDoorStripe, top: '10%' }} />
          <div style={{ ...styles.bayDoorStripe, bottom: '10%' }} />
        </div>
      </div>

      {/* Highway */}
      <div style={styles.highway}>
        <div style={styles.highwayLanes}>
          {[20, 40, 60, 80].map((top, i) => (
            <div key={i} style={{ ...styles.highwayLane, top: `${top}%` }} />
          ))}
        </div>
      </div>

      {/* Highway Walls */}
      <div style={{ ...styles.highwayWall, ...styles.highwayWallLeft, ...(wallsShaking ? styles.wallShaking : {}) }}>
        <div style={{ ...styles.crack, ...styles.crack1, opacity: visibleCracks.crack1 ? 1 : 0 }}>
          <svg viewBox="0 0 40 80" style={{ width: '100%', height: '100%' }}>
            <path d="M20 0 L15 20 L25 35 L10 50 L20 70 L15 80" stroke="#ff3333" strokeWidth="2" fill="none" />
            <path d="M20 0 L25 15 L15 25" stroke="#ff3333" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
        <div style={{ ...styles.crack, ...styles.crack2, opacity: visibleCracks.crack2 ? 1 : 0 }}>
          <svg viewBox="0 0 35 60" style={{ width: '100%', height: '100%' }}>
            <path d="M18 0 L10 20 L20 40 L15 60" stroke="#ff3333" strokeWidth="2" fill="none" />
          </svg>
        </div>
      </div>
      <div style={{ ...styles.highwayWall, ...styles.highwayWallRight, ...(wallsShaking ? styles.wallShaking : {}) }}>
        <div style={{ ...styles.crack, ...styles.crack3, opacity: visibleCracks.crack3 ? 1 : 0 }}>
          <svg viewBox="0 0 45 90" style={{ width: '100%', height: '100%' }}>
            <path d="M22 0 L30 25 L15 45 L25 70 L20 90" stroke="#ff3333" strokeWidth="2" fill="none" />
            <path d="M22 0 L18 10 L28 20" stroke="#ff3333" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
        <div style={{ ...styles.crack, ...styles.crack4, opacity: visibleCracks.crack4 ? 1 : 0 }}>
          <svg viewBox="0 0 38 70" style={{ width: '100%', height: '100%' }}>
            <path d="M19 0 L25 25 L12 45 L20 70" stroke="#ff3333" strokeWidth="2" fill="none" />
          </svg>
        </div>
      </div>

      {/* Glucose Canvas */}
      <canvas ref={canvasRef} style={styles.glucoseCanvas} />

      {/* Alarm Banner */}
      <div style={{ ...styles.alarmBanner, ...(alarmBannerActive ? styles.alarmBannerActive : {}) }}>
        ⚠ INCOMING CARGO ⚠
      </div>

      {/* Pressure Meter */}
      <div style={{ ...styles.pressureMeter, opacity: pressureMeterVisible ? 1 : 0 }}>
        <div style={{ ...styles.pressureFill, height: `${pressure}%`, background: getPressureFillStyle() }} />
        <div style={styles.pressureLabel}>PRESSURE</div>
      </div>

      {/* Dialogue Box */}
      <div style={{ ...styles.dialogueBox, opacity: dialogueVisible ? 1 : 0 }}>
        <p style={styles.dialogueText} dangerouslySetInnerHTML={{ __html: dialogueText }} />
      </div>

      {/* UI Elements */}
      <div style={styles.timestamp}>{timestamp}</div>
      <div style={styles.episodeTitle}>
        EPISODE 1<br />
        <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>THE DELIVERY</span>
      </div>
      <div style={styles.sceneIndicator}>SCENE 1: THE INFLUX</div>

      {/* Effects */}
      <div style={styles.vignette} />
      <div style={styles.scanlines} />

      {/* Start Overlay */}
      <div style={{ ...styles.startOverlay, ...(showStartOverlay ? {} : styles.startOverlayHidden) }}>
        <div style={styles.startTitle}>GLUCOSE MANAGEMENT</div>
        <div style={styles.startEpisode}>THE DELIVERY</div>
        <div style={styles.startSubtitle}>Theme: The High-Stakes Handoff</div>
        <button style={styles.startButton} onClick={startAnimation}>
          ▶ START
        </button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          background: #0a0a0f;
          overflow: hidden;
          font-family: 'Rajdhani', sans-serif;
        }
        
        @keyframes alarmPulse {
          0%, 100% { 
            opacity: 0.3;
            box-shadow: 0 0 20px #ff0000;
          }
          50% { 
            opacity: 1;
            box-shadow: 0 0 60px #ff0000, 0 0 100px #ff0000;
          }
        }
        
        @keyframes alarmText {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        
        @keyframes wallShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        
        .highlight {
          color: #ff6b6b;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};

const styles = {
  sceneContainer: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
  },
  stomachSector: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(180deg, #1a0a1a 0%, #0f0a15 50%, #0a0510 100%)',
  },
  gridOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundImage: `
      linear-gradient(rgba(255, 100, 150, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 100, 150, 0.03) 1px, transparent 1px)
    `,
    backgroundSize: '50px 50px',
  },
  bayDoorContainer: {
    position: 'absolute',
    top: '10%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '400px',
    height: '300px',
    perspective: '1000px',
  },
  bayDoorFrame: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    border: '8px solid #3a2a3a',
    borderRadius: '10px',
    boxShadow: '0 0 30px rgba(255, 50, 100, 0.3), inset 0 0 50px rgba(0, 0, 0, 0.8)',
    background: 'linear-gradient(180deg, #1a1020 0%, #0f0815 100%)',
  },
  bayDoor: {
    position: 'absolute',
    width: '48%',
    height: '90%',
    top: '5%',
    background: 'linear-gradient(180deg, #2a1a2a 0%, #1a0f1a 100%)',
    border: '3px solid #4a3a4a',
    transition: 'transform 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  bayDoorLeft: {
    left: '2%',
    transformOrigin: 'left center',
    borderRadius: '5px 0 0 5px',
  },
  bayDoorRight: {
    right: '2%',
    transformOrigin: 'right center',
    borderRadius: '0 5px 5px 0',
  },
  bayDoorLeftOpen: {
    transform: 'rotateY(-110deg)',
  },
  bayDoorRightOpen: {
    transform: 'rotateY(110deg)',
  },
  bayDoorStripe: {
    position: 'absolute',
    width: '100%',
    height: '20px',
    background: `repeating-linear-gradient(
      90deg,
      #ff6b00 0px,
      #ff6b00 20px,
      #1a1a1a 20px,
      #1a1a1a 40px
    )`,
  },
  alarmLight: {
    position: 'absolute',
    top: '5%',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: '#ff0000',
    opacity: 0,
  },
  alarmLightLeft: {
    left: '20%',
  },
  alarmLightRight: {
    right: '20%',
  },
  alarmLightActive: {
    animation: 'alarmPulse 0.5s ease-in-out infinite',
  },
  highway: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '40%',
    background: `linear-gradient(180deg, 
      transparent 0%,
      rgba(139, 0, 50, 0.2) 20%,
      rgba(139, 0, 50, 0.4) 100%
    )`,
  },
  highwayLanes: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  highwayLane: {
    position: 'absolute',
    height: '3px',
    width: '100%',
    background: `linear-gradient(90deg, 
      transparent 0%,
      rgba(255, 100, 100, 0.5) 50%,
      transparent 100%
    )`,
  },
  highwayWall: {
    position: 'absolute',
    bottom: 0,
    width: '60px',
    height: '40%',
    background: 'linear-gradient(180deg, #3a1a2a 0%, #2a0f1f 100%)',
    border: '2px solid #5a2a3a',
  },
  highwayWallLeft: {
    left: 0,
    borderLeft: 'none',
  },
  highwayWallRight: {
    right: 0,
    borderRight: 'none',
  },
  wallShaking: {
    animation: 'wallShake 0.1s ease-in-out infinite',
  },
  crack: {
    position: 'absolute',
    transition: 'opacity 0.5s',
  },
  crack1: { top: '10%', left: '5px', width: '40px', height: '80px' },
  crack2: { top: '50%', left: '10px', width: '35px', height: '60px' },
  crack3: { top: '20%', right: '5px', width: '45px', height: '90px' },
  crack4: { top: '60%', right: '8px', width: '38px', height: '70px' },
  glucoseCanvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  alarmBanner: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontFamily: "'Orbitron', monospace",
    fontSize: '2.5rem',
    fontWeight: 900,
    color: '#ff3333',
    textShadow: '0 0 20px #ff0000, 0 0 40px #ff0000',
    opacity: 0,
    letterSpacing: '8px',
    whiteSpace: 'nowrap',
  },
  alarmBannerActive: {
    animation: 'alarmText 0.8s ease-in-out infinite',
  },
  pressureMeter: {
    position: 'absolute',
    top: '50%',
    right: '80px',
    transform: 'translateY(-50%)',
    width: '30px',
    height: '200px',
    background: 'rgba(20, 10, 20, 0.8)',
    border: '2px solid #4a3a4a',
    borderRadius: '15px',
    overflow: 'hidden',
    transition: 'opacity 0.5s',
  },
  pressureFill: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    transition: 'height 0.3s',
    borderRadius: '0 0 13px 13px',
  },
  pressureLabel: {
    position: 'absolute',
    top: '-25px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontFamily: "'Orbitron', monospace",
    fontSize: '0.6rem',
    color: 'rgba(255, 100, 100, 0.8)',
    whiteSpace: 'nowrap',
  },
  dialogueBox: {
    position: 'absolute',
    bottom: '10%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '80%',
    maxWidth: '800px',
    background: 'rgba(10, 5, 15, 0.9)',
    border: '2px solid rgba(255, 100, 100, 0.5)',
    borderRadius: '10px',
    padding: '20px 30px',
    transition: 'opacity 0.5s',
  },
  dialogueText: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: '1.4rem',
    color: '#ffffff',
    lineHeight: 1.6,
    textAlign: 'center',
    margin: 0,
  },
  timestamp: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    fontFamily: "'Orbitron', monospace",
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  episodeTitle: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    fontFamily: "'Orbitron', monospace",
    fontSize: '0.8rem',
    color: 'rgba(255, 200, 100, 0.7)',
    textAlign: 'right',
  },
  sceneIndicator: {
    position: 'absolute',
    top: '60px',
    left: '20px',
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  vignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.7) 100%)',
    pointerEvents: 'none',
  },
  scanlines: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `repeating-linear-gradient(
      0deg,
      transparent 0px,
      transparent 2px,
      rgba(0, 0, 0, 0.1) 2px,
      rgba(0, 0, 0, 0.1) 4px
    )`,
    pointerEvents: 'none',
    opacity: 0.3,
  },
  startOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(10, 5, 15, 0.95)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    transition: 'opacity 1s',
  },
  startOverlayHidden: {
    opacity: 0,
    pointerEvents: 'none',
  },
  startTitle: {
    fontFamily: "'Orbitron', monospace",
    fontSize: '1rem',
    color: 'rgba(255, 200, 100, 0.8)',
    marginBottom: '10px',
    letterSpacing: '4px',
  },
  startEpisode: {
    fontFamily: "'Orbitron', monospace",
    fontSize: '2.5rem',
    fontWeight: 900,
    color: '#ffffff',
    marginBottom: '10px',
  },
  startSubtitle: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: '1.2rem',
    color: 'rgba(255, 100, 100, 0.8)',
    marginBottom: '40px',
  },
  startButton: {
    fontFamily: "'Orbitron', monospace",
    fontSize: '1.2rem',
    padding: '15px 50px',
    background: 'transparent',
    border: '2px solid #ff6b6b',
    color: '#ff6b6b',
    cursor: 'pointer',
    borderRadius: '5px',
    transition: 'all 0.3s',
    letterSpacing: '3px',
  },
};

export default GlucoseDelivery;
