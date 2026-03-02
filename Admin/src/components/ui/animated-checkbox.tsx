import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
}

const tickVariants = {
  checked: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.3 }
  },
  unchecked: {
    pathLength: 0,
    opacity: 0,
    transition: { duration: 0.3 }
  }
}

const boxVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
}

export function AnimatedCheckbox({
  checked = false,
  onCheckedChange,
  className,
  ...props
}: AnimatedCheckboxProps) {
  console.log("checked", props)
  return (
    <motion.div
      className={cn(
        "relative h-4 w-4 rounded border border-primary",
        checked && "bg-primary",
        className
      )}
      variants={boxVariants}
      whileHover="hover"
      whileTap="tap"
      onClick={() => onCheckedChange?.(!checked)}
    >
      <motion.svg
        className="absolute inset-0 h-full w-full stroke-white stroke-[4]"
        viewBox="0 0 24 24"
        fill="none"
        initial={false}
      >
        <motion.path
          d="M6 12L10 16L18 8"
          variants={tickVariants}
          initial="unchecked"
          animate={checked ? "checked" : "unchecked"}
        />
      </motion.svg>
    </motion.div>
  )
}
