'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User } from '@/payload-types'
import { useAuth } from '@/providers/Auth'
import axios from 'axios'
import { KeyRound, Lock, Mail, UserRound } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type FormData = {
  email: string
  name: User['name']
  password: string
  passwordConfirm: string
}

export const AccountForm: React.FC = () => {
  const { setUser, user } = useAuth()
  const [changePassword, setChangePassword] = useState(false)

  const {
    formState: { errors, isLoading, isSubmitting, isDirty },
    handleSubmit,
    register,
    reset,
    watch,
  } = useForm<FormData>()

  const password = useRef({})
  password.current = watch('password', '')

  const router = useRouter()

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (user) {
        try {
          const response = await axios.patch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${user.id}`, data, {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            },
          })

          const json = response.data
          setUser(json.doc)
          toast.success('Successfully updated account.')
          setChangePassword(false)
          reset({
            name: json.doc.name,
            email: json.doc.email,
            password: '',
            passwordConfirm: '',
          })
        } catch (e) {
          toast.error('There was a problem updating your account.')
        }
      }
    },
    [user, setUser, reset],
  )

  useEffect(() => {
    if (user === null) {
      router.push(
        `/login?error=${encodeURIComponent(
          'You must be logged in to view this page.',
        )}&redirect=${encodeURIComponent('/account')}`,
      )
    }

    // Once user is loaded, reset form to have default values
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        password: '',
        passwordConfirm: '',
      })
    }
  }, [user, router, reset, changePassword])

  return (
    <form className="max-w-xl" onSubmit={handleSubmit(onSubmit)}>
      {!changePassword ? (
        <Fragment>
          <div className="prose dark:prose-invert mb-8 text-sm text-muted-foreground w-full">
            <p className="flex items-center gap-1.5 flex-wrap">
              <span className="opacity-80">Trang thông tin cá nhân. Bạn có thể thay đổi chi tiết bên dưới, hoặc </span>
              <Button
                className="px-0 h-auto font-semibold text-primary/80 underline-offset-4 hover:text-primary transition-all underline"
                onClick={() => setChangePassword(!changePassword)}
                type="button"
                variant="link"
              >
                bấm vào đây
              </Button>
              <span className="opacity-80"> để đổi mật khẩu.</span>
            </p>
          </div>

          <div className="flex flex-col gap-6 mb-8 w-full max-w-lg">
            <FormItem>
              <Label htmlFor="email" className="font-bold flex items-center gap-2 text-foreground mb-1.5">
                <span className="text-primary/70 flex items-center"><Mail className="w-4 h-4" /></span> Email đăng nhập
              </Label>
              <Input
                id="email"
                {...register('email', { required: 'Vui lòng nhập một địa chỉ email.' })}
                type="email"
                className="h-12 px-4 rounded-xl border-border/50 bg-muted/5 focus-visible:ring-primary/20 shadow-sm transition-all text-sm"
              />
              {errors.email && <FormError message={errors.email.message} />}
            </FormItem>

            <FormItem>
              <Label htmlFor="name" className="font-bold flex items-center gap-2 text-foreground mb-1.5">
                <span className="text-primary/70 flex items-center"><UserRound className="w-4 h-4" /></span> Họ và tên
              </Label>
              <Input
                id="name"
                {...register('name', { required: 'Vui lòng nhập tên của bạn.' })}
                type="text"
                className="h-12 px-4 rounded-xl border-border/50 bg-muted/5 focus-visible:ring-primary/20 shadow-sm transition-all text-sm"
              />
              {errors.name && <FormError message={errors.name.message} />}
            </FormItem>
          </div>
        </Fragment>
      ) : (
        <Fragment>
          <div className="prose dark:prose-invert mb-8 text-sm text-muted-foreground w-full">
            <p className="flex items-center gap-1.5 flex-wrap">
              <span className="opacity-80">Thay đổi mật khẩu tài khoản của bạn bên dưới, hoặc </span>
              <Button
                className="px-0 h-auto font-semibold text-primary/80 underline-offset-4 hover:text-primary transition-all underline"
                onClick={() => setChangePassword(!changePassword)}
                type="button"
                variant="link"
              >
                hủy bỏ
              </Button>
              <span className="opacity-80">.</span>
            </p>
          </div>

          <div className="flex flex-col gap-6 mb-8 w-full max-w-lg">
            <FormItem>
              <Label htmlFor="password" className="font-bold flex items-center gap-2 text-foreground mb-1.5">
                <span className="text-primary/70 flex items-center"><KeyRound className="w-4 h-4" /></span> Mật khẩu mới
              </Label>
              <Input
                id="password"
                {...register('password', { required: 'Vui lòng cung cấp mật khẩu mới.' })}
                type="password"
                className="h-12 px-4 rounded-xl border-border/50 bg-muted/5 focus-visible:ring-primary/20 shadow-sm transition-all text-sm"
              />
              {errors.password && <FormError message={errors.password.message} />}
            </FormItem>

            <FormItem>
              <Label htmlFor="passwordConfirm" className="font-bold flex items-center gap-2 text-foreground mb-1.5">
                <span className="text-primary/70 flex items-center"><Lock className="w-4 h-4" /></span> Xác nhận mật khẩu
              </Label>
              <Input
                id="passwordConfirm"
                {...register('passwordConfirm', {
                  required: 'Vui lòng xác nhận mật khẩu mới của bạn.',
                  validate: (value) => value === password.current || 'Mật khẩu không khớp.',
                })}
                type="password"
                className="h-12 px-4 rounded-xl border-border/50 bg-muted/5 focus-visible:ring-primary/20 shadow-sm transition-all text-sm"
              />
              {errors.passwordConfirm && <FormError message={errors.passwordConfirm.message} />}
            </FormItem>
          </div>
        </Fragment>
      )}
      <div className="w-full max-w-lg mt-4">
        <Button disabled={isLoading || isSubmitting || !isDirty} type="submit" variant="default" className="w-[180px] h-12 rounded-xl font-bold px-8 shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
          {isLoading || isSubmitting
            ? <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin flex items-center justify-center mx-auto" />
            : changePassword
              ? 'Lưu Mật Khẩu'
              : 'Lưu Thay Đổi'}
        </Button>
      </div>
    </form>
  )
}
