import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'elevated'
  className?: string
  hover?: boolean
  onClick?: () => void
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className,
  hover = false,
  onClick
}) => {
  const baseClasses = variant === 'elevated' ? 'card-elevated' : 'card'
  
  const Component = onClick ? motion.div : 'div'
  const motionProps = onClick ? {
    whileHover: { scale: 1.02, y: -2 },
    whileTap: { scale: 0.98 },
    className: clsx(baseClasses, 'cursor-pointer', className)
  } : {
    className: clsx(baseClasses, className)
  }

  return (
    <Component
      {...motionProps}
      onClick={onClick}
    >
      {children}
    </Component>
  )
}
