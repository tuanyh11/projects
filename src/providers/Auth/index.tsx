'use client'

import type { User } from '@/payload-types'
import axios from 'axios'
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

// eslint-disable-next-line no-unused-vars
type ResetPassword = (args: {
  password: string
  passwordConfirm: string
  token: string
}) => Promise<void>

type ForgotPassword = (args: { email: string }) => Promise<void> // eslint-disable-line no-unused-vars

type Create = (args: { email: string; password: string; passwordConfirm: string }) => Promise<void> // eslint-disable-line no-unused-vars

type Login = (args: { email: string; password: string }) => Promise<User> // eslint-disable-line no-unused-vars

type Logout = () => Promise<void>

type AuthContext = {
  create: Create
  forgotPassword: ForgotPassword
  login: Login
  logout: Logout
  resetPassword: ResetPassword
  setUser: (user: User | null) => void // eslint-disable-line no-unused-vars
  status: 'loggedIn' | 'loggedOut' | undefined
  user?: User | null
}

const Context = createContext({} as AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>()

  // used to track the single event of logging in or logging out
  // useful for `useEffect` hooks that should only run once
  const [status, setStatus] = useState<'loggedIn' | 'loggedOut' | undefined>()
  const create = useCallback<Create>(async (args) => {
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/create`, {
        email: args.email,
        password: args.password,
        passwordConfirm: args.passwordConfirm,
      }, {
        withCredentials: true,
      })

      if (data.errors) throw new Error(data.errors[0].message)
      setUser(data?.data?.loginUser?.user || data?.loginUser?.user || data.user)
      setStatus('loggedIn')
    } catch (e: any) {
      if (e.response?.data?.errors) throw new Error(e.response.data.errors[0].message)
      throw new Error('An error occurred while attempting to login.')
    }
  }, [])

  const login = useCallback<Login>(async (args) => {
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/login`, {
        email: args.email,
        password: args.password,
      }, {
        withCredentials: true,
      })

      if (data.errors) throw new Error(data.errors[0].message)
      setUser(data.user)
      setStatus('loggedIn')
      return data.user
    } catch (e: any) {
      if (e.response?.data?.errors) throw new Error(e.response.data.errors[0].message)
      throw new Error('An error occurred while attempting to login.')
    }
  }, [])

  const logout = useCallback<Logout>(async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/logout`, undefined, {
        withCredentials: true,
      })
      setUser(null)
      setStatus('loggedOut')
    } catch (e) {
      throw new Error('An error occurred while attempting to logout.')
    }
  }, [])

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/me`, {
          withCredentials: true,
        })
        setUser(data.user || null)
        setStatus(data.user ? 'loggedIn' : undefined)
      } catch (e) {
        setUser(null)
        throw new Error('An error occurred while fetching your account.')
      }
    }

    void fetchMe()
  }, [])

  const forgotPassword = useCallback<ForgotPassword>(async (args) => {
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/forgot-password`, {
        email: args.email,
      }, {
        withCredentials: true,
      })

      if (data.errors) throw new Error(data.errors[0].message)
      setUser(data?.data?.loginUser?.user || data?.loginUser?.user || data.user)
    } catch (e: any) {
      if (e.response?.data?.errors) throw new Error(e.response.data.errors[0].message)
      throw new Error('An error occurred while attempting to login.')
    }
  }, [])

  const resetPassword = useCallback<ResetPassword>(async (args) => {
    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/reset-password`, {
        password: args.password,
        passwordConfirm: args.passwordConfirm,
        token: args.token,
      }, {
        withCredentials: true,
      })

      if (data.errors) throw new Error(data.errors[0].message)
      const u = data?.data?.loginUser?.user || data?.loginUser?.user || data.user
      setUser(u)
      setStatus(u ? 'loggedIn' : undefined)
    } catch (e: any) {
      if (e.response?.data?.errors) throw new Error(e.response.data.errors[0].message)
      throw new Error('An error occurred while attempting to login.')
    }
  }, [])

  return (
    <Context.Provider
      value={{
        create,
        forgotPassword,
        login,
        logout,
        resetPassword,
        setUser,
        status,
        user,
      }}
    >
      {children}
    </Context.Provider>
  )
}

type UseAuth<T = User> = () => AuthContext // eslint-disable-line no-unused-vars

export const useAuth: UseAuth = () => useContext(Context)
