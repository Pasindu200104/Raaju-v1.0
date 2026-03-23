import { useEffect, useRef } from 'react';

export default function VoiceVisualizer({ isListening, isSpeaking }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const dataArrayRef = useRef(new Uint8Array(256));
  const analyserRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      // Canvas dimensions
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Clear canvas with dark background
      ctx.fillStyle = '#0a0e27';
      ctx.fillRect(0, 0, width, height);

      // Generate waveform data
      if (isListening || isSpeaking) {
        timeRef.current += 0.05;
      }

      const time = timeRef.current;

      // Draw multiple lines for heartbeat effect
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();

      for (let x = 0; x < width; x++) {
        let y = centerY;

        if (isListening) {
          // Listening waveform - smaller waves
          const freq1 = Math.sin((x / width) * Math.PI * 4 + time) * 15;
          const freq2 = Math.sin((x / width) * Math.PI * 8 + time * 0.7) * 8;
          const noise = (Math.random() - 0.5) * 10;
          y = centerY - (freq1 + freq2 + noise);
        } else if (isSpeaking) {
          // Speaking waveform - prominent heartbeat pattern
          const beat = Math.max(0, Math.cos((time * 4 + (x / width) * 2) % (Math.PI * 2)) - 0.7) * 40;
          const secondary = Math.sin((x / width) * Math.PI * 6 + time * 1.5) * 15;
          y = centerY - (beat + secondary);
        } else {
          // Idle waveform - flat line with gentle pulse
          const pulse = Math.sin(time * 2) * 2;
          y = centerY + pulse;
        }

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      // Draw glow effect
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.2)';
      ctx.lineWidth = 4;
      ctx.beginPath();

      for (let x = 0; x < width; x++) {
        let y = centerY;

        if (isListening) {
          const freq1 = Math.sin((x / width) * Math.PI * 4 + time) * 15;
          const freq2 = Math.sin((x / width) * Math.PI * 8 + time * 0.7) * 8;
          const noise = (Math.random() - 0.5) * 10;
          y = centerY - (freq1 + freq2 + noise);
        } else if (isSpeaking) {
          const beat = Math.max(0, Math.cos((time * 4 + (x / width) * 2) % (Math.PI * 2)) - 0.7) * 40;
          const secondary = Math.sin((x / width) * Math.PI * 6 + time * 1.5) * 15;
          y = centerY - (beat + secondary);
        } else {
          const pulse = Math.sin(time * 2) * 2;
          y = centerY + pulse;
        }

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening, isSpeaking]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={200}
      className="w-full max-w-4xl mx-auto rounded-lg shadow-2xl"
      style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #0f1437 100%)' }}
    />
  );
}
