'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  email: string
  password: string
}

export const LoginForm: React.FC = () => {
  const searchParams = useSearchParams()
  const allParams = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const redirect = useRef(searchParams.get('redirect'))
  const { login } = useAuth()
  const router = useRouter()
  const [error, setError] = React.useState<null | string>(null)

  const {
    formState: { errors, isLoading },
    handleSubmit,
    register,
  } = useForm<FormData>()

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        await login(data)
        if (redirect?.current) router.push(redirect.current)
        else router.push('/account')
      } catch (_) {
        setError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.')
      }
    },
    [login, router],
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Message className="mb-4" error={error} />

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
          <div className="flex justify-between items-center mb-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Mật khẩu
            </Label>
            <Link href={`/recover-password${allParams}`} className="text-xs text-primary hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="h-12 rounded-xl border-border/70 focus:border-primary focus:ring-2 focus:ring-primary/20 bg-[#FAFBF8]"
            {...register('password', { required: 'Vui lòng nhập mật khẩu.' })}
          />
          {errors.password && <FormError message={errors.password.message} />}
        </FormItem>
      </div>

      <Button
        className="w-full h-12 rounded-xl font-semibold text-base mt-8 bg-primary hover:bg-primary/90 transition-all"
        disabled={isLoading}
        type="submit"
      >
        {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">hoặc</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <Button asChild variant="outline" className="w-full h-12 rounded-xl font-semibold text-sm">
        <Link href={`/create-account${allParams}`}>
          Tạo tài khoản mới
        </Link>
      </Button>
    </form>
  )
}
