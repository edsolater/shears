import { Tuples } from '../../../../packages/fnkit'
import { bilibiliLinkCardItem } from './bilibili'

export type LinkCardItem = {
  name: string
  /** youtube need vpn  */
  needVPN?: boolean
  subBlocks?: SubLinkCard[]
  /* default is other */
  category?: 'video' | 'game' | 'music' | 'shopping' | 'news' | 'social' | 'other'
  description: string
  keywords: string[]
  headerLogo?: string
  favicon: string
  howToDo?: string | string[]
  searchUrl?: {
    breif: string
    regex: RegExp
    vars: {
      [key: string]: unknown
    }
  }
}

/**
 * big Card may have sub cards
 */
export type SubLinkCard = {
  subName: string
  search?: {
    url: string
  }
}

export const linkCards = [bilibiliLinkCardItem] satisfies Tuples
