import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'
import React, { useEffect, useMemo, useState } from 'react'

//const { role } = UserAuth()

const permissions = {
  admin: ['*'], // admin can access everything
  major: ['/dashboardManager', '/fsb', '/board', '/addjob', '/history'],
  minor: ['/fsb'],
  guest: ['/login'], // fallback for unauthenticated users
}

/** Escape string for regex */
function escapeForRegex(s) {
  return s.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&')
}

/** returns true if `pattern` matches `path` */
function matchPattern(pattern, path) {
  if (!pattern) return false
  if (pattern === '*' || pattern === '/*') return true

  // prefix wildcard '/foo/*'
  if (pattern.endsWith('/*')) {
    const base = pattern.slice(0, -1) // keep trailing slash: '/foo/'
    return path.startsWith(base)
  }

  // other wildcard use (e.g. '/foo/*/bar' or '/foo/*baz')
  if (pattern.includes('*')) {
    // convert wildcard to regex: '*' -> '.*'
    const regexStr = '^' + escapeForRegex(pattern).split('\\*').join('.*') + '$'
    const re = new RegExp(regexStr)
    return re.test(path)
  }

  // exact match
  return path === pattern
}

/**
 * Check whether a given role is allowed to access a pathname.
 * - role: string or array-of-strings. If falsy -> treated as 'guest'.
 * - pathname: string (e.g. window location pathname)
 */
export function isRouteAllowed(role, pathname) {
  const path = pathname || '/'
  let rolesToCheck = []

  if (!role) {
    rolesToCheck = ['guest']
  } else if (Array.isArray(role)) {
    rolesToCheck = role.map((r) => (r || '').toLowerCase().trim())
  } else {
    rolesToCheck = [String(role).toLowerCase().trim()]
  }

  // For each role, check its allowed patterns
  for (const r of rolesToCheck) {
    const patterns = permissions[r] || permissions.guest || []
    if (patterns.some((p) => matchPattern(p, path))) return true
  }

  return false
}

export default function usePermission(role, pathname) {
  const location = useLocation()
  const path = pathname ?? location.pathname

  const granted = useMemo(() => {
    return isRouteAllowed(role, path)
  }, [role, path])

  return granted
}
