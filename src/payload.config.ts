import { sqliteAdapter } from '@payloadcms/db-sqlite'
import {
  BoldFeature,
  EXPERIMENTAL_TableFeature,
  IndentFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { vi } from '@payloadcms/translations/languages/vi'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Banners } from '@/collections/Banners'
import { Categories } from '@/collections/Categories'
import { ContactSubmissions } from '@/collections/ContactSubmissions'
import { Destinations } from '@/collections/Destinations'
import { Media } from '@/collections/Media'
import { Pages } from '@/collections/Pages'
import { Posts } from '@/collections/Posts'
import { Reviews } from '@/collections/Reviews'
import { Rooms } from '@/collections/Rooms'
import { Users } from '@/collections/Users'
import { getDistricts, getProvinces, getWards } from '@/endpoints/ghn-address'
import { Footer } from '@/globals/Footer'
import { Header } from '@/globals/Header'
import { HomePage } from '@/globals/HomePage'
import { SiteSettings } from '@/globals/SiteSettings'
import { plugins } from './plugins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      beforeLogin: ['@/components/BeforeLogin#BeforeLogin'],
      beforeDashboard: ['@/components/BeforeDashboard#BeforeDashboard'],
      afterNav: ['@/components/Admin/OrderNotifier#OrderNotifier'],
    },
    meta: {
      titleSuffix: ' — Hồng Thái Admin',
      description: 'Hệ thống quản trị du lịch Hồng Thái Na Hang',
    },
    user: Users.slug,
  },
  collections: [Users, Pages, Categories, Media, Banners, Reviews, Destinations, Rooms, Posts, ContactSubmissions],
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || '',
    },
  }),
  editor: lexicalEditor({
    features: () => {
      return [
        UnderlineFeature(),
        BoldFeature(),
        ItalicFeature(),
        OrderedListFeature(),
        UnorderedListFeature(),
        LinkFeature({
          enabledCollections: ['pages'],
          fields: ({ defaultFields }) => {
            const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
              if ('name' in field && field.name === 'url') return false
              return true
            })

            return [
              ...defaultFieldsWithoutUrl,
              {
                name: 'url',
                type: 'text',
                admin: {
                  condition: ({ linkType }) => linkType !== 'internal',
                },
                label: ({ t }) => t('fields:enterURL'),
                required: true,
              },
            ]
          },
        }),
        IndentFeature(),
        EXPERIMENTAL_TableFeature(),
      ]
    },
  }),
  //email: nodemailerAdapter(),
  endpoints: [getProvinces, getDistricts, getWards],
  globals: [Header, Footer, HomePage, SiteSettings],
  i18n: {
    supportedLanguages: { vi, en },
  },
  plugins,
  secret: process.env.PAYLOAD_SECRET || (() => { throw new Error('PAYLOAD_SECRET environment variable is required') })(),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
