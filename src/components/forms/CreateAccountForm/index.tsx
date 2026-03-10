'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import axios from 'axios'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  email: string
  password: string
  passwordConfirm: string
}

export const CreateAccountForm: React.FC = () => {
  const searchParams = useSearchParams()
  const allParams = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const { login } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const {
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = useForm<FormData>()

  const password = useRef({})
  password.current = watch('password', '')

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users`, data, {
          headers: { 'Content-Type': 'application/json' },
        })
      } catch (e: any) {
        const message = e.response?.statusText || 'Đã xảy ra lỗi khi tạo tài khoản.'
        setError(message)
        return
      }

      const redirect = searchParams.get('redirect')
      const timer = setTimeout(() => setLoading(true), 1000)

      try {
        await login(data)
        clearTimeout(timer)
        if (redirect) router.push(redirect)
        else router.push(`/account?success=${encodeURIComponent('Tạo tài khoản thành công!')}`)
      } catch (_) {
        clearTimeout(timer)
        setError('Đã xảy ra lỗi. Vui lòng thử lại.')
      }
    },
    [login, router, searchParams],
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Message error={error} className="mb-4" />

      <div className="space-y-5">
        <FormItem>
          <Label htmlFor="email" className="text-sm font-medium text-foreground mb-1.5 block">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="h-12 rounded-xl border-border/70 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-[#FAFBF8]"
            {...register('email', { required: 'Vui lòng nhập email.' })}
          />
          {errors.email && <FormError message={errors.email.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="password" className="text-sm font-medium text-foreground mb-1.5 block">
            Mật khẩu
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Tối thiểu 6 ký tự"
            className="h-12 rounded-xl border-border/70 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-[#FAFBF8]"
            {...register('password', { required: 'Vui lòng nhập mật khẩu.' })}
          />
          {errors.password && <FormError message={errors.password.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="passwordConfirm" className="text-sm font-medium text-foreground mb-1.5 block">
            Xác nhận mật khẩu
          </Label>
          <Input
            id="passwordConfirm"
            type="password"
            placeholder="Nhập lại mật khẩu"
            className="h-12 rounded-xl border-border/70 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-[#FAFBF8]"
            {...register('passwordConfirm', {
              required: 'Vui lòng xác nhận mật khẩu.',
              validate: (value) => value === password.current || 'Mật khẩu không khớp.',
            })}
          />
          {errors.passwordConfirm && <FormError message={errors.passwordConfirm.message} />}
        </FormItem>
      </div>

      <Button
        className="w-full h-12 rounded-xl font-semibold text-base mt-8 bg-primary hover:bg-primary/90 transition-all"
        disabled={loading}
        type="submit"
      >
        {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">hoặc</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <Button asChild variant="outline" className="w-full h-12 rounded-xl font-semibold text-sm">
        <Link href={`/login${allParams}`}>
          Đã có tài khoản? Đăng nhập
        </Link>
      </Button>
    </form>
  )
}
