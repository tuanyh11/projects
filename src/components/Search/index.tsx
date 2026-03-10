'use client'

import { cn } from '@/utilities/cn'
import { createUrl } from '@/utilities/createUrl'
import { SearchIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'

type Props = {
  className?: string
}

export const Search: React.FC<Props> = ({ className }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { register, handleSubmit, setValue } = useForm<{ search: string }>({
    defaultValues: {
      search: searchParams?.get('q') || '',
    },
  })

  // Update default value when search params change externally
  useEffect(() => {
    setValue('search', searchParams?.get('q') || '')
  }, [searchParams, setValue])

  const onSubmit = (data: { search: string }) => {
    const newParams = new URLSearchParams(searchParams.toString())

    if (data.search) {
      newParams.set('q', data.search)
    } else {
      newParams.delete('q')
    }

    router.push(createUrl('/shop', newParams))
  }

  return (
    <form className={cn('relative w-full', className)} onSubmit={handleSubmit(onSubmit)}>
      <input
        autoComplete="off"
        className="w-full rounded-lg border bg-white px-4 py-2 text-sm text-black placeholder:text-neutral-500 dark:border-neutral-800 dark:bg-black dark:text-white dark:placeholder:text-neutral-400"
        {...register('search')}
        placeholder="Search for products..."
        type="text"
      />
      <div className="absolute right-0 top-0 mr-3 flex h-full items-center">
        <SearchIcon className="h-4" />
      </div>
    </form>
  )
}
