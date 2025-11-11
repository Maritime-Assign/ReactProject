import { expect } from "vitest";
import "@testing-library/jest-dom";
import React from 'react'
import { vi } from 'vitest'
import { renderHook } from "@testing-library/react";
import { isRouteAllowed } from "../components/PermissionsTable";
import usePermission from "../components/PermissionsTable";

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useLocation: () => location = {pathname: '/history'},
    }
})

describe ('Use Permission Functions', () => {
    describe ('matchPattern Functionality', () => {
        function escapeForRegex(s) {
            return s.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&')
        }
        
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
        test('* and /* Test', () => {
            expect(matchPattern('*', '*')).toBe(true);
            expect(matchPattern('/*', '/*')).toBe(true);
        })

        test('Prefix Wildcard Test', () => {
            expect(matchPattern('/test/*', '/test/')).toBe(true);
        })

        test('Complex Wildcard Test', () => {
            expect(matchPattern('/*test', '/test')).toBe(true);
        })

        test('Falsy Pattern Test', () => {
            expect(matchPattern('', '')).toBe(false);
        })

        test('Exact Match Test', () => {
            expect(matchPattern('/test', '/test')).toBe(true);
        })
    })

    describe ('isRouteAllowed Functionality', () => {
        test('Single Role Test', () => {
            expect(isRouteAllowed('dispatch', '/board')).toBe(true);
        })

        test('Array of Roles Test', () => {
            expect(isRouteAllowed(['admin', 'dispatch', 'display'], '/login')).toBe(true);
        })

        test('Guest Fallback Test', () => {
            expect(isRouteAllowed('','/login')).toBe(true);
        })

        test('Unknown Role Fallback Test', () => {
            expect(isRouteAllowed('unknown','/board')).toBe(false);
        })

        test('Case/Trim Normalization Test', () => {
            expect(isRouteAllowed('   dispatch  ','/board')).toBe(true);
        })

        test('Admin Wildcard Test', () => {
            expect(isRouteAllowed('admin', '/*/login')).toBe(true);
        })
    })

    describe('usePermission Functionality', () => {
        test( 'Explicit Pathname Works', () => {
            const { result } = renderHook(() => usePermission('display', '/fsb'));
            expect(result).toStrictEqual({ current: true});
        })

        test( 'Router Location Pathname Returns True', () => {
            const { result } = renderHook(() => usePermission('dispatch'));
            expect(result).toStrictEqual({ current: true});
        })

        test( 'Router Location Pathname Returns False', () => {
            const { result } = renderHook(() => usePermission('guest'));
            expect(result).toStrictEqual({ current: false});
        })
    })
})