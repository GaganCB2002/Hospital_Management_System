import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function ScrollReveal({ children, className, direction = 'up', delay = 0, duration = 0.5, distance = 40, once = true }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: '-60px' });

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? distance : direction === 'down' ? -distance : 0,
      x: direction === 'left' ? distance : direction === 'right' ? -distance : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration, delay, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
