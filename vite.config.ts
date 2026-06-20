import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { g2bNoticeUrl, sampleNotices } from './src/app/lib/bidData'

const G2B_ENDPOINT = 'https://apis.data.go.kr/1230000/ad/BidPublicInfoService/getBidPblancListInfoServc'

function g2bProxy() {
  let cache: { at: number; notices: unknown[] } | null = null
  return {
    name: 'g2b-server-proxy',
    configureServer(server) {
      server.middlewares.use('/api/g2b/notices', async (req, res) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        const force = new URL(req.url ?? '/', 'http://localhost').searchParams.get('refresh') === '1'
        if (!force && cache && Date.now() - cache.at < 30 * 60 * 1000) {
          res.end(JSON.stringify({ notices: cache.notices, source: '공공데이터포털 나라장터 API', cached: true, fetchedAt: new Date(cache.at).toISOString() }))
          return
        }
        const key = process.env.G2B_SERVICE_KEY
        if (!key) {
          res.end(JSON.stringify({ notices: sampleNotices, source: '예시 데이터 (API 키 미설정)', cached: false, fetchedAt: new Date().toISOString() }))
          return
        }
        try {
          const now = new Date(); const from = new Date(now.getTime() - 7 * 86400000)
          const stamp = (d: Date) => d.toISOString().replace(/[-:T]/g, '').slice(0, 12)
          const params = new URLSearchParams({ serviceKey: key, pageNo: '1', numOfRows: '100', type: 'json', inqryDiv: '1', inqryBgnDt: stamp(from), inqryEndDt: stamp(now) })
          const response = await fetch(`${G2B_ENDPOINT}?${params}`)
          if (!response.ok) throw new Error(`G2B ${response.status}`)
          const body: any = await response.json()
          const raw = body?.response?.body?.items ?? []
          const items = Array.isArray(raw) ? raw : raw.item ? (Array.isArray(raw.item) ? raw.item : [raw.item]) : []
          const keywords = ['시설관리', '미화', '경비', '인력운영', '물류운영']
          const notices = items.filter((x: any) => keywords.some(k => String(x.bidNtceNm ?? '').includes(k))).map((x: any) => ({
            id: x.bidNtceNo + (x.bidNtceOrd ? `-${x.bidNtceOrd}` : ''), agency: x.ntceInsttNm || x.dminsttNm,
            title: x.bidNtceNm, region: x.prtcptPsblRgnNm || '전국', amount: Number(x.asignBdgtAmt || x.presmptPrce || 0),
            deadline: x.bidClseDt ? `${x.bidClseDt} ${x.bidClseTm || ''}` : '', url: x.bidNtceDtlUrl || g2bNoticeUrl(x.bidNtceNo, String(x.bidNtceOrd || '000').padStart(3, '0')),
            period: x.cntrctCnclsMthdNm || '공고문 참조', industry: x.indstrytyNm || '관련 용역',
          }))
          if (!notices.length) throw new Error('관련 용역 공고 없음')
          cache = { at: Date.now(), notices }
          res.end(JSON.stringify({ notices, source: '공공데이터포털 나라장터 API', cached: false, fetchedAt: new Date(cache.at).toISOString() }))
        } catch (error) {
          res.end(JSON.stringify({ notices: sampleNotices, source: `예시 데이터 (API 전환: ${error instanceof Error ? error.message : '연결 오류'})`, cached: false, fetchedAt: new Date().toISOString() }))
        }
      })
    },
  }
}


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    figmaAssetResolver(),
    g2bProxy(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
