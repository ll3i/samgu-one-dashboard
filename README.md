
# AI 운영매니저 지원 시스템

## 실행

```powershell
npm install
$env:G2B_SERVICE_KEY="공공데이터포털에서 발급받은 서비스키"
npm run dev
```

`G2B_SERVICE_KEY`는 Vite 개발 서버의 `/api/g2b/notices` 프록시에서만 사용하며 클라이언트 코드로 전달하지 않습니다. 키가 없거나 나라장터 API 호출이 실패하면 화면은 동일한 구조의 예시 공고로 자동 전환하고 출처를 표시합니다. 정상 응답은 서버 메모리에 30분간 캐시됩니다.

이 저장소는 통합 시제품입니다. 운영 배포에서는 `/api/g2b/notices`와 계약 원가 API를 인증된 별도 백엔드로 이전하고, 고객사 계정에는 원가·마진 필드를 반환하지 않아야 합니다.

  This is a code bundle for AI 운영매니저 지원 시스템. The original project is available at https://www.figma.com/design/urZVyIOP0LKyhPCRXU87y8/AI-%EC%9A%B4%EC%98%81%EB%A7%A4%EB%8B%88%EC%A0%80-%EC%A7%80%EC%9B%90-%EC%8B%9C%EC%8A%A4%ED%85%9C.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

## Site map

The site control view uses OpenStreetMap tiles and does not require an API key. The site coordinates are local demo data.
  
