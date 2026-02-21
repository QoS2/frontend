# Quest of Seoul API 문서

## 개요

- **Base URL:** `/api/v1`
- **인증:** JWT Bearer Token 또는 세션(쿠키) 인증 지원
- **Content-Type:** `application/json` (파일 업로드 제외)

---

## 목차

1. [공통 사항](#공통-사항)
2. [인증 (Auth)](#1-인증-auth)
3. [파일 업로드](#2-파일-업로드)
4. [투어 (Tour)](#3-투어-tour)
6. [Swagger UI](#swagger-ui)
7. [수집 API (Place·Treasure·Photo Spot)](#수집-api-placetreasurephoto-spot)

---

## 공통 사항

### 인증 헤더

| 방식 | 헤더 |
|------|------|
| JWT | `Authorization: Bearer <accessToken>` |
| 세션 | 쿠키 기반 (관리자 API) |

### 공통 에러 응답

모든 에러는 다음 형식으로 반환됩니다:

```json
{
  "error": "Bad Request",
  "errorCode": "VALIDATION_FAILED",
  "message": "입력값 검증에 실패했습니다.",
  "timestamp": "2026-02-11T12:00:00",
  "path": "/api/v1/auth/login",
  "errors": {
    "email": "이메일을 입력해 주세요.",
    "password": "비밀번호를 입력해 주세요."
  }
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| error | string | HTTP 상태 설명 (예: Bad Request) |
| errorCode | string | 애플리케이션 에러 코드 |
| message | string | 사용자용 에러 메시지 |
| timestamp | string | ISO 8601 타임스탬프 |
| path | string | 요청 경로 (선택) |
| errors | object | 필드별 검증 에러 (선택, `VALIDATION_FAILED` 시) |

### 에러 코드 목록

| errorCode | HTTP | 설명 |
|-----------|------|------|
| VALIDATION_FAILED | 400 | `@Valid` 검증 실패 |
| INVALID_REQUEST_BODY | 400 | JSON 파싱 실패 |
| INVALID_PARAMETER_TYPE | 400 | 파라미터 타입 불일치 |
| ILLEGAL_ARGUMENT | 400 | 잘못된 인자 |
| NOT_FOUND | 404 | 리소스 없음 |
| UNAUTHORIZED | 401 | 인증 필요 |
| AUTHENTICATION_FAILED | 401 | 토큰/세션 인증 실패 |
| AUTHORIZATION_FAILED | 403 | 권한 없음 |
| DUPLICATE_RESOURCE | 409 | 리소스 중복 |
| ILLEGAL_STATE | 409 | 상태 충돌 |
| INTERNAL_SERVER_ERROR | 500 | 서버 오류 |

### HTTP 상태 코드

| 코드 | 설명 |
|------|------|
| 200 | 성공 |
| 201 | 생성 성공 |
| 204 | 삭제 성공 (No Content) |
| 400 | 잘못된 요청 |
| 401 | 인증 필요 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 409 | 충돌 (중복, 상태 오류) |
| 500 | 서버 오류 |

### Nullable 표기 규칙

- 문서 표의 `Nullable`은 해당 필드가 `null`을 허용하는지 의미합니다.
- `O`: null 허용, `X`: null 불가
- `필수` 컬럼은 요청 시 값 제공 필요 여부를 의미합니다.

---

## 1. 인증 (Auth)

**Base Path:** `/api/v1/auth`

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| POST | `/login` | - | 이메일/비밀번호 로그인 → JWT 발급 |
| POST | `/register` | - | 회원가입 → JWT 발급 |
| GET | `/me` | JWT 또는 세션 | 현재 사용자 조회 |
| POST | `/token` | 세션 | OAuth2 세션 → JWT 발급 |
| POST | `/refresh` | Refresh Cookie | 리프레시 토큰 쿠키로 JWT 재발급 (회전) |

---

### 1.1 로그인

```
POST /api/v1/auth/login
Content-Type: application/json
```

**Request Body (LoginRequest)**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

| 필드 | 타입 | 필수 | Nullable | 설명 |
|------|------|------|----------|------|
| email | string | O | X | 이메일 (형식 검증) |
| password | string | O | X | 비밀번호 |

**검증 규칙**
- `email`: `@NotBlank`, `@Email`
- `password`: `@NotBlank`

**Response 200**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400,
  "tokenType": "Bearer"
}
```

| 필드 | 타입 | Nullable | 설명 |
|------|------|----------|------|
| accessToken | string | X | JWT 액세스 토큰 |
| expiresIn | number | X | 토큰 만료 시간 (초) |
| tokenType | string | X | `"Bearer"` |

---

### 1.2 회원가입

```
POST /api/v1/auth/register
Content-Type: application/json
```

**Request Body (RegisterRequest)**

```json
{
  "email": "user@example.com",
  "password": "password1234",
  "nickname": "홍길동"
}
```

| 필드 | 타입 | 필수 | Nullable | 설명 |
|------|------|------|----------|------|
| email | string | O | X | 이메일 (형식 검증) |
| password | string | O | X | 비밀번호 (8자 이상) |
| nickname | string | X | O | 닉네임 |

**검증 규칙**
- `email`: `@NotBlank`, `@Email`
- `password`: `@NotBlank`, `@Size(min=8)`
- `nickname`: 선택

**Response 201**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400,
  "tokenType": "Bearer"
}
```

| 필드 | 타입 | Nullable | 설명 |
|------|------|----------|------|
| accessToken | string | X | JWT 액세스 토큰 |
| expiresIn | number | X | 토큰 만료 시간 (초) |
| tokenType | string | X | `"Bearer"` |

---

### 1.3 현재 사용자 조회

```
GET /api/v1/auth/me
Authorization: Bearer <accessToken>
```

**Response 200**

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "role": "ADMIN"
}
```

| 필드 | 타입 | Nullable | 설명 |
|------|------|----------|------|
| userId | string(UUID) | X | 사용자 ID |
| role | string | X | `ADMIN` \| `USER` |

**Response 401** — 비로그인

---

### 1.4 OAuth2 → JWT 토큰 발급

```
POST /api/v1/auth/token
Cookie: JSESSIONID=...
```

세션 인증 후 JWT를 발급합니다. OAuth2 로그인 직후 앱에서 JWT로 전환할 때 사용.

> JWT payload에는 `role` 클레임(`ADMIN` 또는 `USER`)이 포함됩니다.

**Response 200**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400,
  "tokenType": "Bearer"
}
```

| 필드 | 타입 | Nullable | 설명 |
|------|------|----------|------|
| accessToken | string | X | JWT 액세스 토큰 |
| expiresIn | number | X | 토큰 만료 시간 (초) |
| tokenType | string | X | `"Bearer"` |

---

### 1.5 리프레시 토큰으로 JWT 재발급

```
POST /api/v1/auth/refresh
Cookie: qos_refresh_token=...
```

`HttpOnly` refresh cookie를 검증한 뒤 액세스 토큰을 재발급하고, refresh cookie도 회전합니다.

**Response 200**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400,
  "tokenType": "Bearer"
}
```

| 필드 | 타입 | Nullable | 설명 |
|------|------|----------|------|
| accessToken | string | X | 새 JWT 액세스 토큰 |
| expiresIn | number | X | 토큰 만료 시간 (초) |
| tokenType | string | X | `"Bearer"` |

**Response 401** — refresh cookie 없음/만료/위변조

---

## 2. 파일 업로드

**Base Path:** `/api/v1/upload`  
**인증:** Bearer JWT 또는 세션 필수

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/` | multipart/form-data로 S3 업로드 후 URL 반환 |
| DELETE | `/?url=...` | S3에 업로드된 파일 URL로 삭제 (본 서비스 버킷만 가능) |

---

### 2.1 파일 업로드

```
POST /api/v1/upload
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Request (multipart/form-data)**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| file | file | O | 업로드할 파일 |
| type | string | X | `"image"` \| `"audio"` — 미지정 시 Content-Type으로 판별 |
| category | string | X | 폴더 카테고리 (tour, spot, mission, intro, ambient 등, 기본: general). 경로: images/{category}/, audio/{category}/ |

**지원 형식**
- **이미지:** jpeg, png, gif, webp
- **오디오:** mp3, wav, ogg, m4a

**Response 200**

```json
{
  "url": "https://s3.ap-northeast-2.amazonaws.com/bucket/path/file.jpg"
}
```

**Response 401** — 인증 필요  
**Response 500** — S3 비활성화 등 (예: "파일 업로드가 비활성화되어 있습니다.")

---

### 2.2 업로드 파일 삭제

```
DELETE /api/v1/upload?url=<S3_URL>
Authorization: Bearer <accessToken>
```

**Query Parameters**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| url | string | O | 삭제할 S3 파일의 전체 URL (인코딩 필요) |

**제한:** 본 서비스 S3 버킷에 업로드된 URL만 삭제 가능. 외부 URL은 400 에러.

**Response 204** — 삭제 성공 (No Content)

**Response 400** — 유효하지 않은 URL 또는 외부 버킷 URL  
**Response 401** — 인증 필요  
**Response 500** — S3 삭제 실패

---

## 3. 투어 (Tour)

**Base Path:** `/api/v1`

---

### 3.1 투어 목록

```
GET /api/v1/tours
```

**인증:** 불필요 (공개)

**Response 200**

```json
[
  {
    "id": 1,
    "externalKey": "gyeongbokgung",
    "title": "경복궁 핵심 투어",
    "thumbnailUrl": "https://s3.../tour-thumb.jpg",
    "description": "조선의 대표 궁궐을 둘러보는 핵심 코스입니다.",
    "counts": { "main": 8, "sub": 12, "photo": 5, "treasure": 3, "missions": 4 },
    "estimatedDurationMin": 90,
    "accessStatus": "UNLOCKED",
    "tags": [{ "id": 1, "name": "역사", "slug": "history" }]
  }
]
```

| 필드 | 타입 | 설명 |
|------|------|------|
| id | long | 투어 ID |
| externalKey | string | 외부 식별 키 |
| title | string | 표시 제목 |
| thumbnailUrl | string | 대표 썸네일 URL |
| description | string | 설명 |
| counts | object | main, sub, photo, treasure, missions |
| estimatedDurationMin | int | 예상 소요 시간(분) |
| accessStatus | string | LOCKED \| UNLOCKED |
| tags | array | 태그 목록 |

---

### 3.2 투어 디테일

```
GET /api/v1/tours/{tourId}
```

접근 상태, 진행 Run, 액션 버튼, 맵 스팟 등 포함. **인증 시** `access`, `currentRun`, `actions` 등 추가 정보 반환.

**Path Parameters**

| 이름 | 타입 | 설명 |
|------|------|------|
| tourId | long | 투어 ID |

**Response 200**

```json
{
  "tourId": 1,
  "title": "경복궁 핵심 투어",
  "description": "조선의 대표 궁궐을 둘러보는 핵심 코스입니다.",
  "tags": [
    { "id": 1, "name": "역사", "slug": "history" }
  ],
  "counts": {
    "main": 8,
    "sub": 12,
    "photo": 5,
    "treasure": 3,
    "missions": 4
  },
  "info": {
    "entrance_fee": { "adult": 3000, "child": 1500 },
    "available_hours": [
      { "day": "weekday", "open": "09:00", "close": "18:00" }
    ],
    "estimated_duration_min": 90
  },
  "goodToKnow": ["한복 입장 무료", "편한 신발 추천"],
  "startSpot": {
    "spotId": 1,
    "title": "광화문",
    "lat": 37.576,
    "lng": 126.977,
    "radiusM": 60
  },
  "mapSpots": [
    {
      "spotId": 1,
      "type": "MAIN",
      "title": "광화문",
      "lat": 37.576,
      "lng": 126.977,
      "thumbnailUrl": "https://s3.../thumb.jpg",
      "isHighlight": true
    },
    {
      "spotId": 9,
      "type": "TREASURE",
      "title": "비밀의 문",
      "lat": 37.579,
      "lng": 126.975,
      "thumbnailUrl": null,
      "isHighlight": false
    }
  ],
  "access": { "status": "UNLOCKED", "hasAccess": true },
  "thumbnails": ["https://s3.../images/tour/img1.jpg", "https://s3.../images/tour/img2.jpg"],
  "currentRun": {
    "runId": 101,
    "status": "IN_PROGRESS",
    "startedAt": "2026-02-11T10:00:00",
    "progress": {
      "completedCount": 2,
      "totalCount": 8,
      "completedSpotIds": [1, 3]
    }
  },
  "actions": {
    "primaryButton": "CONTINUE",
    "secondaryButton": "GPS_TO_START"
  }
}
```

**응답 필드 상세**

| 필드 | 타입 | 설명 |
|------|------|------|
| tourId | long | 투어 ID |
| title | string | 표시 제목 |
| description | string | 설명 |
| tags | array | 태그 목록 (id, name, slug) |
| counts | object | main, sub, photo, treasure, missions 개수 |
| info | object | entrance_fee, available_hours, estimated_duration_min (infoJson 기반) |
| goodToKnow | array | 팁 배열 (goodToKnowJson: {"tips": ["a","b"]} 또는 루트 배열 지원) |
| startSpot | object | 시작 스팟 (spotId, title, lat, lng, radiusM) |
| mapSpots | array | 맵에 표시할 스팟 (MAIN + TREASURE, thumbnailUrl + isHighlight 포함) |
| access | object | status: LOCKED \| UNLOCKED, hasAccess |
| thumbnails | array | 투어 디테일 캐러셀용 이미지 URL (tour_assets 우선, 없으면 메인 플레이스 이미지) |
| currentRun | object | IN_PROGRESS인 Run (없으면 null) |
| actions | object | 버튼 액션 정보 |
| mainMissionPath | array | Main Mission Path (스팟별 미션 목록) |

**mainMissionPath** 각 항목: `spotId`, `spotTitle`, `orderIndex`, `missions` (stepId, missionId, title)

**actions 규칙**
- `primaryButton`: `UNLOCK` (미접근) \| `START` (접근, Run 없음) \| `CONTINUE` (접근, Run 있음)
- `secondaryButton`: `GPS_TO_START`
- `moreActions`: 현재 기본 null

**tours.info_json 스키마** (입장료·운영시간·예상소요시간 등)

```json
{
  "entrance_fee": { "adult": 3000, "child": 1500 },
  "available_hours": [{ "day": "weekday", "open": "09:00", "close": "18:00" }],
  "estimated_duration_min": 90
}
```

**tours.good_to_know_json 스키마** (팁 목록)

```json
{ "tips": ["한복 입장 무료", "편한 신발 추천", "화요일 휴궁"] }
```
또는 루트 배열 `["한복 입장 무료", "편한 신발 추천"]` 형식도 지원.

---

### 3.3 마커 목록

기존 `/api/v1/tours/{tourId}/markers`는 제거되었습니다.  
마커 정보는 `GET /api/v1/tours/{tourId}`의 `mapSpots`로 통합됩니다.

---

### 3.4 Unlock

```
POST /api/v1/tours/{tourId}/access/unlock
Authorization: Bearer <accessToken>
```

**인증:** JWT 필수

`user_tour_access`를 UNLOCKED로 설정하여 해당 투어 접근을 해제합니다.

**Response 200** — 빈 본문

**Response 401** — 인증 필요  
**Response 404** — Tour not found

---

### 3.5 Run 처리

```
POST /api/v1/tours/{tourId}/runs
Authorization: Bearer <accessToken>
Content-Type: application/json
```

투어 Run 시작/재개. 유저당 투어별 `IN_PROGRESS` Run은 1개만 유지됩니다.

**Path Parameters**

| 이름 | 타입 | 설명 |
|------|------|------|
| tourId | long | 투어 ID |

**Request Body**

```json
{
  "mode": "START"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| mode | string | O | `START` \| `CONTINUE` |

**RunMode**

| 값 | 설명 |
|----|------|
| START | 새 Run 시작 |
| CONTINUE | 기존 IN_PROGRESS Run 재개 |

**Response 200**

```json
{
  "runId": 101,
  "tourId": 1,
  "status": "IN_PROGRESS",
  "mode": "START",
  "progress": {
    "completedCount": 2,
    "totalCount": 8,
    "completedSpotIds": [1, 3]
  },
  "startSpot": {
    "spotId": 1,
    "title": "광화문",
    "lat": 37.576,
    "lng": 126.977,
    "radiusM": 60
  }
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| runId | long | Run ID |
| tourId | long | 투어 ID |
| status | string | IN_PROGRESS \| COMPLETED \| ABANDONED |
| mode | string | 요청한 RunMode |
| progress | object | completedCount, totalCount, completedSpotIds |
| startSpot | object | 시작 스팟 정보 |

---

### 3.6 근접 감지

```
POST /api/v1/tour-runs/{runId}/proximity
Authorization: Bearer <accessToken>
Content-Type: application/json
```

현재 위치가 스팟 반경(radiusM, 기본 50m) 안에 들어오면 해당 스팟 유형별 이벤트를 반환합니다.
- **Main/Sub Place**: 가이드 스크립트 + `UserSpotProgress` unlock
- **Treasure**: 첫 발견 시 `TREASURE_FOUND` 알람 + `UserTreasureStatus` unlock
- **Photo Spot**: `PHOTO_SPOT_FOUND` 알람

**Path Parameters**

| 이름 | 타입 | 설명 |
|------|------|------|
| runId | long | Tour Run ID |

**Query Parameters**

| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| lang | string | X | `KO`, `EN`, `JP`, `CN` (소문자 ko, en, jp, cn 가능) — 기본 `ko` |

**Request Body (ProximityRequest)**

```json
{
  "lat": 37.5796,
  "lng": 126.9769
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| lat | number | O | 현재 위도 |
| lng | number | O | 현재 경도 |

**Response 200** — 근접 스팟 있을 때

```json
{
  "event": "PROXIMITY",
  "contentType": "GUIDE",
  "sessionId": 201,
  "context": {
    "refType": "SPOT",
    "refId": 1,
    "placeName": "광화문",
    "spotType": "MAIN"
  },
  "message": {
    "turnId": 501,
    "role": "GUIDE",
    "source": "SCRIPT",
    "text": "광화문에 오신 것을 환영합니다. 이곳은 경복궁의 정문으로...",
    "assets": [
      { "id": 1, "type": "IMAGE", "url": "https://s3.../image.jpg", "meta": null }
    ],
    "delayMs": 1500,
    "action": {
      "type": "AUTO_NEXT",
      "nextApi": "/api/v1/chat-sessions/201/turns/502"
    }
  }
}
```

**action.type 규칙** (spot_content_steps.next_action 기반)
- 같은 컨텐츠(step) 내 중간 턴: `AUTO_NEXT` (`nextApi`로 자동 진행)
- 컨텐츠(step) 마지막 턴: `NEXT` (다음) \| `MISSION_CHOICE` (게임 시작)
- `MISSION_CHOICE`는 `stepId`(MISSION step)를 포함하며, 다음 컨텐츠가 있으면 `nextApi`도 함께 포함될 수 있습니다.

**Response 200** — Treasure 근접 (첫 발견 시)

```json
{
  "event": "TREASURE_FOUND",
  "contentType": "TREASURE_ALARM",
  "sessionId": null,
  "context": { "refType": "SPOT", "refId": 9, "placeName": "풍기대", "spotType": "TREASURE" },
  "message": null
}
```

**Response 200** — Photo Spot 근접

```json
{
  "event": "PHOTO_SPOT_FOUND",
  "contentType": "PHOTO_ALARM",
  "sessionId": null,
  "context": { "refType": "SPOT", "refId": 5, "placeName": "근정전 앞 광장", "spotType": "PHOTO" },
  "message": null
}
```

**Response 204** — 근접 스팟 없음

| 필드 | 설명 |
|------|------|
| event | `PROXIMITY` \| `TREASURE_FOUND` \| `PHOTO_SPOT_FOUND` |
| contentType | `GUIDE` \| `TREASURE_ALARM` \| `PHOTO_ALARM` |
| sessionId | 채팅 세션 ID (GUIDE만 해당, Treasure/Photo는 null) |
| context | refType, refId, placeName, spotType |
| message | 단일 가이드 턴 (GUIDE만), Treasure/Photo는 null |

---

### 3.6.1 Collect Treasure

```
POST /api/v1/tour-runs/{runId}/treasures/{spotId}/collect
Authorization: Bearer <accessToken>
```

Treasure 50m 근접 후 상세 확인 → "Collect Treasure" 클릭 시 도감에 추가.

**Response 200** — 빈 본문

---

### 3.6.2 다음 장소 조회

```
GET /api/v1/tour-runs/{runId}/next-spot
Authorization: Bearer <accessToken>
```

Run 진행 상태를 기준으로 다음 MAIN/SUB 장소를 반환합니다.

**Response 200**

```json
{
  "runId": 101,
  "status": "IN_PROGRESS",
  "hasNextSpot": true,
  "nextSpot": {
    "spotId": 3,
    "spotType": "MAIN",
    "title": "근정전",
    "lat": 37.579,
    "lng": 126.977,
    "radiusM": 50,
    "orderIndex": 2
  },
  "progress": {
    "completedCount": 1,
    "totalCount": 8,
    "completedSpotIds": [1]
  }
}
```

`hasNextSpot = false`이면 `nextSpot`은 null이며, 상황에 따라 run 상태가 `COMPLETED`로 전환됩니다.

---

### 3.7 채팅 세션 조회/생성

```
GET /api/v1/tour-runs/{runId}/spots/{spotId}/chat-session
Authorization: Bearer <accessToken>
```

Run + Spot에 대한 채팅 세션 ID를 반환합니다. 없으면 생성합니다.
**MAIN/SUB 스팟만 대상**이며, 해당 스팟이 **unlock 상태**여야 합니다.

**Path Parameters**

| 이름 | 타입 | 필수 | Nullable | 설명 |
|------|------|------|----------|------|
| runId | long | O | X | Tour Run ID |
| spotId | long | O | X | Spot ID (MAIN/SUB, unlock 상태) |

**Response 200**

```json
{
  "sessionId": 201,
  "status": "ACTIVE",
  "lastTurnId": 505
}
```

| 필드 | 타입 | Nullable | 설명 |
|------|------|----------|------|
| sessionId | long | X | 채팅 세션 ID |
| status | string | X | `ACTIVE` \| `COMPLETED` |
| lastTurnId | long | O | 마지막으로 노출된 스크립트 턴 ID (아직 없으면 `null`) |

---

### 3.8 채팅 히스토리

```
GET /api/v1/chat-sessions/{sessionId}/turns
Authorization: Bearer <accessToken>
```

**Path Parameters**

| 이름 | 타입 | 필수 | Nullable | 설명 |
|------|------|------|----------|------|
| sessionId | long | O | X | 채팅 세션 ID |

**Response 200**

```json
{
  "sessionId": 201,
  "status": "ACTIVE",
  "nextScriptApi": "/api/v1/chat-sessions/201/turns/502",
  "hasNextScript": true,
  "turns": [
    {
      "turnId": 501,
      "role": "USER",
      "source": "USER",
      "text": "이 건물의 역사가 궁금해요",
      "assets": [],
      "delayMs": null,
      "action": null,
      "createdAt": "2026-02-11T10:30:00"
    },
    {
      "turnId": 502,
      "role": "GUIDE",
      "source": "SCRIPT",
      "text": "근정전은 1395년 태조에 의해 건축된 조선의 정전입니다...",
      "assets": [{ "id": 1, "type": "IMAGE", "url": "https://s3.../image.jpg", "meta": null }],
      "delayMs": 1500,
      "action": { "type": "AUTO_NEXT", "nextApi": "/api/v1/chat-sessions/201/turns/503" },
      "createdAt": "2026-02-11T10:30:05"
    }
  ]
}
```

**Response 필드**

| 필드 | 타입 | Nullable | 설명 |
|------|------|----------|------|
| sessionId | long | X | 채팅 세션 ID |
| status | string | X | `ACTIVE` \| `COMPLETED` |
| nextScriptApi | string | O | 다음 스크립트 턴 API (없으면 `null`) |
| hasNextScript | boolean | X | 남은 스크립트 존재 여부 |
| turns | array | X | 턴 목록 |

**turns[] 필드**

| 필드 | 타입 | Nullable | 설명 |
|------|------|----------|------|
| turnId | long | X | 턴 ID |
| role | string | X | `USER` \| `GUIDE` \| `SYSTEM` (ChatRole) |
| source | string | X | `USER` \| `SCRIPT` \| `LLM` (ChatSource) |
| text | string | O | 발화 텍스트 |
| assets | array | X | 연결된 에셋 목록 |
| delayMs | int | O | 스크립트 자동 노출 지연(ms), SCRIPT가 아니면 `null` |
| action | object | O | 턴 이후 동작 정보 (`AUTO_NEXT`, `NEXT`, `MISSION_CHOICE`) |
| createdAt | string | O | ISO 8601 생성 시각 |

---

### 3.8.1 다음 스크립트 턴 조회

```
GET /api/v1/chat-sessions/{sessionId}/turns/{nextTurnId}
Authorization: Bearer <accessToken>
```

`nextApi`로 받은 `nextTurnId`의 단일 턴을 반환합니다.

---

### 3.9 채팅 메시지 전송

```
POST /api/v1/chat-sessions/{sessionId}/messages
Authorization: Bearer <accessToken>
Content-Type: application/json
```

유저 질문 전송 후 AI 응답을 바로 반환합니다.

**Request Body (ChatMessageRequest)**

```json
{
  "text": "이 건물의 역사가 궁금해요"
}
```

| 필드 | 타입 | 필수 | Nullable | 설명 |
|------|------|------|----------|------|
| text | string | O | X | 유저 메시지 (`@NotBlank`) |

**Response 200**

```json
{
  "userTurnId": 503,
  "userText": "이 건물의 역사가 궁금해요",
  "aiTurnId": 504,
  "aiText": "근정전은 1395년 태조에 의해 건축된 조선의 정전입니다...",
  "nextScriptApi": "/api/v1/chat-sessions/201/turns/505",
  "hasNextScript": true
}
```

| 필드 | 타입 | Nullable | 설명 |
|------|------|----------|------|
| userTurnId | long | X | 저장된 사용자 턴 ID |
| userText | string | X | 사용자 발화 |
| aiTurnId | long | X | 저장된 AI 턴 ID |
| aiText | string | O | AI 응답 텍스트 |
| nextScriptApi | string | O | 다음 스크립트 턴 API (없으면 `null`) |
| hasNextScript | boolean | X | 남은 스크립트 존재 여부 |

---

### 3.10 스팟 (상세·가이드)

#### 3.10.1 스팟 상세 (Place/Treasure 더블모달)

```
GET /api/v1/spots/{spotId}
GET /api/v1/spots/{spotId}/detail
```

**인증:** 불필요 (공개)

Place/Treasure/Photo Spot 공통 상세 정보. `titleKr`, `pronunciationUrl`, `address` 포함.

**Response 200**

```json
{
  "spotId": 1,
  "type": "MAIN",
  "title": "광화문",
  "titleKr": "광화문",
  "description": "...",
  "pronunciationUrl": "https://s3.../audio.mp3",
  "thumbnailUrl": "https://s3.../image.jpg",
  "lat": 37.576,
  "lng": 126.977,
  "address": "161 Sajik-ro, Jongno-gu, Seoul"
}
```

#### 3.10.2 스팟 가이드 (가이드 세그먼트)

```
GET /api/v1/spots/{spotId}/guide
```

스팟 페이지용 가이드 세그먼트(설명 + 이미지) 조회. **인증:** JWT 필수.

**Path Parameters**

| 이름 | 타입 | 설명 |
|------|------|------|
| spotId | long | Spot ID |

**Query Parameters**

| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| lang | string | X | `ko`, `en`, `jp`, `cn` — 기본 `ko` |

**Response 200**

```json
{
  "stepId": 1,
  "stepTitle": "광화문",
  "nextAction": "NEXT",
  "segments": [
    {
      "id": 10,
      "segIdx": 1,
      "text": "광화문에 오신 것을 환영합니다! 이곳은 경복궁의 정문으로...",
      "triggerKey": null,
      "assets": [
        { "id": 1, "type": "IMAGE", "url": "https://s3.../image.jpg", "meta": null }
      ],
      "delayMs": 2000
    }
  ]
}
```

| 필드 | 설명 |
|------|------|
| stepId | 스팟 ID (spotId와 동일) |
| stepTitle | 스팟 제목 |
| nextAction | `NEXT` \| `MISSION_CHOICE` (마지막 GUIDE 컨텐츠 기준, null 가능) |
| segments[].id | 스크립트 라인 ID |
| segments[].segIdx | 세그먼트 순서 |
| segments[].text | 가이드 문장 |
| segments[].triggerKey | 트리거 키 (있는 경우) |
| segments[].assets | 첨부 에셋 (id, type, url, meta) |
| segments[].delayMs | 자동 재생 딜레이(ms) |

#### 3.10.3 미션 스텝 상세

```
GET /api/v1/content-steps/{stepId}/mission
Authorization: Bearer <accessToken>
```

**인증:** JWT 필수

Proximity 응답의 MISSION_CHOICE 후, 미션 UI용 prompt·optionsJson 조회. `options_json`/`answer_json` 구조는 본 문서 **4.6.1**을 참조하세요.

**Path Parameters**

| 이름 | 타입 | 설명 |
|------|------|------|
| stepId | long | spot_content_steps.id (MISSION kind) |

**Response 200**

```json
{
  "stepId": 10,
  "missionId": 3,
  "missionType": "QUIZ",
  "prompt": "광화문은 몇 개의 잡상이 있을까요?",
  "optionsJson": {
    "choices": [
      { "id": "a", "text": "1개", "imageUrl": "https://..." },
      { "id": "b", "text": "2개" }
    ],
    "questionImageUrl": "https://..."
  },
  "title": "광화문 퀴즈"
}
```

---

### 3.11 미션 제출

```
POST /api/v1/tour-runs/{runId}/missions/{stepId}/submit
Authorization: Bearer <accessToken>
Content-Type: application/json
```

Run의 step에 연결된 미션을 제출하고 채점합니다.

**Path Parameters**

| 이름 | 타입 | 설명 |
|------|------|------|
| runId | long | Tour Run ID |
| stepId | long | Step ID (spot_content_steps.id) |

**Request Body (MissionSubmitRequest)**

```json
{
  "missionType": "QUIZ",
  "userInput": "사용자 입력 텍스트",
  "photoUrl": "https://s3.../photo.jpg",
  "selectedOptionId": "A"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| missionType | string | O | `QUIZ` \| `OX` \| `PHOTO` \| `TEXT_INPUT` |
| userInput | string | X | 텍스트 입력 |
| photoUrl | string | X | 업로드된 사진 URL |
| selectedOptionId | string | X | 선택 옵션 ID |

미션 타입에 맞는 필드만 전송하면 됩니다.

**Response 200**

```json
{
  "attemptId": 1,
  "isCorrect": true,
  "score": 100,
  "feedback": "정답입니다!",
  "nextStepApi": "/api/v1/tour-runs/10/next-spot"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| attemptId | long | 제출 시도 ID |
| isCorrect | boolean | 정답 여부 |
| score | int | 점수 |
| feedback | string | 피드백 메시지 |
| nextStepApi | string | 다음 단계 API (`/api/v1/content-steps/{stepId}/mission` 또는 `/api/v1/tour-runs/{runId}/next-spot`) |

---


### 5.1 Place Collection (플레이스 도감)

MAIN, SUB 타입 스팟을 도감처럼 수집. `user_spot_progress`(progress_status ≠ PENDING) 기반.

#### 5.1.1 내 Place 컬렉션 조회

```
GET /api/v1/collections/places
Authorization: Bearer <accessToken>
```

| Query | 타입 | 필수 | 설명 |
|-------|------|------|------|
| tourId | long | X | 투어 ID — 미지정 시 전체 |
| lang | string | X | ko, en, jp, cn — 기본 ko (현재 미사용) |

**Response 200**

```json
{
  "totalCollected": 12,
  "totalAvailable": 20,
  "items": [
    {
      "spotId": 1,
      "tourId": 1,
      "tourTitle": "경복궁 조선의 왕의 날",
      "type": "MAIN",
      "title": "광화문",
      "description": "...",
      "thumbnailUrl": "https://s3.../gwanggwamun.jpg",
      "collectedAt": "2026-02-14T10:30:00",
      "orderIndex": 1,
      "collected": true
    }
  ]
}
```

#### 5.1.2 Place 컬렉션 요약

```
GET /api/v1/collections/places/summary
Authorization: Bearer <accessToken>
```

**Response 200**

```json
{
  "byTour": [
    { "tourId": 1, "tourTitle": "경복궁...", "collected": 4, "total": 8 }
  ],
  "totalCollected": 12,
  "totalAvailable": 20
}
```

---

### 5.2 Treasure Collection (트레저 도감)

TREASURE 타입 스팟 수집. `user_treasure_status`(status: GET) 기반.

#### 5.2.1 내 Treasure 컬렉션 조회

```
GET /api/v1/collections/treasures
Authorization: Bearer <accessToken>
```

| Query | 타입 | 필수 | 설명 |
|-------|------|------|------|
| tourId | long | X | 투어 ID |
| lang | string | X | ko, en, jp, cn (현재 미사용) |

**Response 200**

```json
{
  "totalCollected": 2,
  "totalAvailable": 2,
  "items": [
    {
      "spotId": 9,
      "tourId": 1,
      "tourTitle": "경복궁 조선의 왕의 날",
      "title": "비밀의 문",
      "description": "...",
      "thumbnailUrl": "https://s3.../treasure1.jpg",
      "gotAt": "2026-02-14T11:00:00",
      "orderIndex": 1,
      "collected": true
    }
  ]
}
```

#### 5.2.2 Treasure 컬렉션 요약

```
GET /api/v1/collections/treasures/summary
Authorization: Bearer <accessToken>
```

#### 5.2.3 Collect Treasure (보물 수집)

```
POST /api/v1/tour-runs/{runId}/treasures/{spotId}/collect
Authorization: Bearer <accessToken>
```

50m 근접 후 "See Treasure now" → 상세 확인 → "Collect Treasure" 클릭 시 호출.

**Response 200** — 빈 본문 (이미 수집된 경우에도 200)

---

### 5.3 Photo Spot API (포토 스팟)

#### user_photo_submissions 테이블

| 컬럼 | 설명 |
|------|------|
| status | PENDING, APPROVED, REJECTED |
| reject_reason | 거절 사유 |
| verified_at | 검증 시각 |
| mint_token | 민트 식별자 (선택) |
| is_public | 노출 여부 |

#### 5.3.1 포토 스팟 목록

```
GET /api/v1/photo-spots
```

**인증:** 불필요

| Query | 타입 | 설명 |
|-------|------|------|
| tourId | long | X | 투어 ID |
| lang | string | X | ko, en, jp, cn (현재 미사용) |

**Response 200** — 배열

```json
[
  {
    "spotId": 5,
    "tourId": 1,
    "tourTitle": "경복궁 조선의 왕의 날",
    "title": "근정전 앞 광장",
    "description": "경복궁 대표 포토 스팟",
    "thumbnailUrl": "https://s3.../photo_spot_1.jpg",
    "latitude": 37.5796,
    "longitude": 126.9769,
    "userPhotoCount": 8,
    "samplePhotos": [
      { "id": 1, "url": "...", "submittedBy": "user1", "mintedAt": "2026-02-10" }
    ]
  }
]
```

#### 5.3.2 포토 제출

```
POST /api/v1/photo-spots/{spotId}/submissions
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Request Body**

```json
{
  "photoUrl": "https://s3.../uploaded_photo.jpg"
}
```

**Response 201**

```json
{
  "submissionId": 102,
  "status": "PENDING",
  "message": "검증 후 승인되면 민트 및 갤러리 노출됩니다."
}
```

#### 5.3.3 내 포토 제출 목록

```
GET /api/v1/photo-spots/my-submissions
Authorization: Bearer <accessToken>
```

| Query | 타입 | 설명 |
|-------|------|------|
| status | string | X | PENDING, APPROVED, REJECTED |
| spotId | long | X | 포토 스팟 ID |

**Response 200** — 배열 직접 반환

```json
[
  {
    "submissionId": 102,
    "spotId": 5,
    "spotTitle": "근정전 앞 광장",
    "photoUrl": "...",
    "status": "PENDING",
    "submittedAt": "2026-02-14T12:00:00",
    "rejectReason": null,
    "mintedAt": null
  }
]
```

#### 5.3.4 포토 스팟 상세

```
GET /api/v1/photo-spots/{spotId}
```

**인증:** 불필요

**Response 200**

```json
{
  "spotId": 5,
  "tourId": 1,
  "tourTitle": "경복궁 조선의 왕의 날",
  "title": "근정전 앞 광장",
  "description": "...",
  "thumbnailUrl": "...",
  "latitude": 37.5796,
  "longitude": 126.9769,
  "address": "161 Sajik-ro, Jongno-gu, Seoul",
  "officialPhotos": [
    { "id": 1, "url": "...", "caption": null }
  ],
  "userPhotos": [
    {
      "submissionId": 101,
      "url": "...",
      "submittedBy": "여행자A",
      "mintedAt": "2026-02-10T14:00:00"
    }
  ]
}
```

---

### 5.4 관리자 API (포토 검증)

#### 5.4.1 제출 목록(상태 필터)

```
GET /api/v1/admin/photo-submissions
GET /api/v1/admin/photo-submissions?status=PENDING
```

| Query | 타입 | 설명 |
|-------|------|------|
| status | string | X | `PENDING`(기본), `APPROVED`, `REJECTED`, `ALL` |

**Response 200**

```json
[
  {
    "submissionId": 102,
    "spotId": 5,
    "spotTitle": "근정전 앞 광장",
    "photoUrl": "https://s3.../uploaded_photo.jpg",
    "status": "PENDING",
    "submittedAt": "2026-02-14T12:00:00",
    "userNickname": "여행자A"
  }
]
```

#### 5.4.2 포토 승인/거절

```
PATCH /api/v1/admin/photo-submissions/{submissionId}
```

**Request Body**

```json
{ "action": "APPROVE" }
```
또는
```json
{ "action": "REJECT", "rejectReason": "포토 스팟과 무관한 이미지입니다." }
```

#### 5.4.3 민트 처리

승인 시 `is_public = true` 설정 및 `mint_token` 자동 생성·저장 (`MINT-{submissionId}-{uuid8}`).

---

### 5.5 스팟 상세 (Place/Treasure 더블모달)

```
GET /api/v1/spots/{spotId}
GET /api/v1/spots/{spotId}/detail
```

**인증:** 불필요

**Response 200**

```json
{
  "spotId": 1,
  "type": "MAIN",
  "title": "광화문",
  "titleKr": "광화문",
  "description": "...",
  "pronunciationUrl": "https://s3.../audio.mp3",
  "thumbnailUrl": "https://s3.../image.jpg",
  "lat": 37.576,
  "lng": 126.977,
  "address": "161 Sajik-ro, Jongno-gu, Seoul"
}
```

---

### 5.6 Proximity API 확장 (근접 알람)

`POST /api/v1/tour-runs/{runId}/proximity` 이벤트 타입:

| event | contentType | 설명 |
|-------|-------------|------|
| PROXIMITY | GUIDE | Main/Sub Place 50m 진입, 가이드 스크립트 |
| TREASURE_FOUND | TREASURE_ALARM | Treasure 50m 진입 (첫 발견) |
| PHOTO_SPOT_FOUND | PHOTO_ALARM | Photo Spot 50m 진입 |

---

### 5.7 인증 정리

| API | 인증 |
|-----|------|
| GET /tours, /tours/{id} | 불필요 |
| GET /spots/{id} | 불필요 (스팟 상세) |
| GET /spots/{id}/guide | **JWT 필수** |
| GET /content-steps/{stepId}/mission | **JWT 필수** |
| GET /photo-spots, /photo-spots/{id} | 불필요 |
| POST /photo-spots/{id}/submissions | JWT 필수 |
| GET /photo-spots/my-submissions | JWT 필수 |
| GET /collections/places, /places/summary, /treasures, /treasures/summary | JWT 필수 |
| POST /tours/{id}/access/unlock | JWT 필수 |
| POST /tours/{id}/runs | JWT 필수 |
| POST /tour-runs/{id}/proximity | JWT 필수 |
| POST /tour-runs/{id}/treasures/{spotId}/collect | JWT 필수 |
| GET /tour-runs/{id}/next-spot | JWT 필수 |
| GET /tour-runs/{id}/spots/{spotId}/chat-session | JWT 필수 |
| GET /chat-sessions/{id}/turns | JWT 필수 |
| GET /chat-sessions/{id}/turns/{nextTurnId} | JWT 필수 |
| POST /chat-sessions/{id}/messages | JWT 필수 |
| POST /tour-runs/{id}/missions/{stepId}/submit | JWT 필수 |
| POST /upload, DELETE /upload | JWT 또는 세션 |
| /admin/** | ADMIN 권한 필수 (JWT 또는 세션) |

**ADMIN 권한 부여 기준**

- `APP_AUTH_ADMIN_EMAILS`: 관리자 이메일 allowlist (쉼표 구분)
- `APP_AUTH_ADMIN_USER_IDS`: 관리자 userId(UUID) allowlist (쉼표 구분)
- 둘 중 하나라도 매칭되면 `ADMIN`, 아니면 `USER`
- 두 allowlist가 모두 비어 있으면 하위 호환을 위해 인증 사용자 전체를 `ADMIN`으로 처리

**JWT/Refresh 주요 환경변수**

- `JWT_ACCESS_TOKEN_EXPIRATION_MS`: 액세스 토큰 만료(ms)
- `JWT_REFRESH_TOKEN_EXPIRATION_MS`: 리프레시 토큰 만료(ms)
- `JWT_REFRESH_COOKIE_NAME`: 리프레시 쿠키 이름
- `JWT_REFRESH_COOKIE_SECURE`: 리프레시 쿠키 `Secure` 플래그 (`true` 권장, HTTPS 환경)

---

## Swagger UI

개발 환경에서 API 문서 확인:

- `/swagger-ui.html`
- `/swagger-ui/index.html`
