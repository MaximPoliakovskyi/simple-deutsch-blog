import Image from 'next/image'
import React from 'react'

type Props = {
  name: string
  role?: string
  children: React.ReactNode
}

export default function TestimonialCard({ name, role, children }: Props) {
  return (
    <article className="bg-white dark:bg-neutral-900 rounded-2xl border border-black/5 dark:border-white/10 p-6 shadow-sm dark:shadow-none hover:bg-neutral-50 dark:hover:bg-neutral-800 transition">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-neutral-200 dark:bg-neutral-700 border border-neutral-200 dark:border-white/10">
          <Image src="/placeholder.webp" alt={name} width={48} height={48} className="w-full h-full object-cover" />
        </div>

        <div>
          <div className="font-semibold text-neutral-900 dark:text-neutral-100">{name}</div>
          {role ? <div className="text-sm text-neutral-500 dark:text-neutral-400">{role}</div> : null}
        </div>
      </div>

      <p className="text-lg leading-relaxed text-neutral-800 dark:text-neutral-200">{children}</p>
    </article>
  )
}
