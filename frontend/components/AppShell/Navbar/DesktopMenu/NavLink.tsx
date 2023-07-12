import React from 'react'
import Link from 'next/link'
import cx from 'clsx'

import { usePathname } from 'next/navigation'

const NavLink = (props: React.ComponentProps<typeof Link>) => {
  const currentPath = usePathname()
  const linkPath =
    (typeof props.href === 'string' ? props.href : props.href.pathname) ?? ''
  const isActive = currentPath.startsWith(linkPath)
  const className = cx(props.className, isActive && 'active')

  return <Link {...props} className={className} />
}

export default NavLink
