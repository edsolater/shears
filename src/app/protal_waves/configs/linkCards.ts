import { Tuples } from '../../../packages/fnkit'

type LinkCardItem = {
  name: string
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

interface BilibiliLinkCardItem extends LinkCardItem {
  name: 'bilibili'
  category: 'video'
  description: 'bilibili web site'
  keywords: ['bilibili', 'video', 'anime', 'game']
  headerLogo: '/protal-icons/bilibili/header-logo.svg'
  favicon: '/protal-icons/bilibili/favicon.svg'
  howToDo: 'search the text'
  searchUrl: {
    breif: 'https://search.bilibili.com/all'
    regex: RegExp
    vars: {
      keyword: string
      /** default is 'all' */
      category?:
        | 'all' /* 全部 */
        | 'video' /* 视频 */
        | 'bangumi' /* 番剧 */
        | 'pgc' /* 影视 */
        | 'live' /* 直播 */
        | 'article' /* 专栏 */
        | 'upuser' /* 用户 */
      order?: 'click' /* 最多点击 */ | 'pubdate' /* 最新发布 */ | 'dm' /* 做多弹幕 */ | 'stow' /* 最多收藏 */
    }
  }
}

export const bilibiliLinkCardItem: BilibiliLinkCardItem = {
  name: 'bilibili',
  category: 'video',
  description: 'bilibili web site',
  keywords: ['bilibili', 'video', 'anime', 'game'],
  headerLogo: '/protal-icons/bilibili/header-logo.svg',
  favicon: '/protal-icons/bilibili/favicon.svg',
  howToDo: 'search the text',
  searchUrl: {
    breif: 'https://search.bilibili.com/all',
    regex: /https:\/\/search\.bilibili\.com\/(<?category>all|video|bangui|pgc|live|article|upuser)/,
    vars: {
      keyword: 'hello+world',
    },
  },
}

export const linkCards = [bilibiliLinkCardItem] satisfies Tuples
