# Quest of Seoul API 문서 (Final)

## 개요
* **Base URL**: `/api/v1`
* **인증**: JWT Bearer Token 또는 세션(쿠키) 인증 지원
* **Content-Type**: `application/json` (파일 업로드 제외)

## 목차
1. 공통 사항
2. 인증 (Auth)
3. 파일 업로드
4. 투어 (Tour)
5. 수집 API (Place·Treasure·Photo Spot)
6. 추후 업데이트 고려사항

---

## 1. 공통 사항

### 인증 헤더
| 방식 | 헤더 |
| --- | --- |
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
    "email": "이메일을 입력해 주세요."
  }
}
```

---

## 2. 인증 (Auth)
**Base Path**: `/api/v1/auth`

### 2.1 로그인
`POST` **/api/v1/auth/login**

- **Content-Type**: `application/json`

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Response 200
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400,
  "tokenType": "Bearer"
}
```

### 2.2 회원가입
`POST` **/api/v1/auth/register**

- **Content-Type**: `application/json`

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "password1234",
  "nickname": "홍길동"
}
```

#### Response 201
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400,
  "tokenType": "Bearer"
}
```

### 2.3 현재 사용자 조회
`GET` **/api/v1/auth/me**

- **Authorization**: `Bearer <accessToken>`

#### Response 200
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 2.4 OAuth2 → JWT 토큰 발급
`POST` **/api/v1/auth/token**

- **Cookie**: `JSESSIONID=...`

OAuth2 로그인(소셜 로그인) 직후 세션을 JWT로 교환할 때 사용합니다.

#### Response 200
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400,
  "tokenType": "Bearer"
}
```

---

## 3. 파일 업로드
**Base Path**: `/api/v1/upload`

### 3.1 파일 업로드
`POST` **/api/v1/upload**

- **Authorization**: `Bearer <accessToken>`
- **Content-Type**: `multipart/form-data`

#### Request
| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| file | file | O | 업로드할 파일 |
| type | string | X | image |
| category | string | X | 저장 경로 구분 (tour, spot, mission 등) |

#### Response 200
```json
{
  "url": "https://s3.ap-northeast-2.amazonaws.com/bucket/path/file.jpg"
}
```

### 3.2 업로드 파일 삭제
`DELETE` **/api/v1/upload?url=<S3_URL>**

- **Authorization**: `Bearer <accessToken>`

#### Response 204 (No Content)

---

## 4. 투어 (Tour)
**Base Path**: `/api/v1`

### 4.1 투어 목록
`GET` **/api/v1/tours**

- **인증**: 불필요

투어 리스트 화면 구성에 필요한 메타 데이터(썸네일, 소요시간, 태그, 카운트 등)를 포함합니다.

#### Response 200
```json
[
  {
    "id": 1,
    "externalKey": "gyeongbokgung",
    "title": "경복궁 핵심 투어",
    "description": "조선의 대표 궁궐을 둘러보는 핵심 코스입니다.",
    "thumbnailUrl": "https://s3.../thumb.jpg",
    "estimatedDurationMin": 90,
    "accessStatus": "UNLOCKED",
    "tags": [
      { "id": 1, "name": "역사", "slug": "history" }
    ],
    "counts": {
      "main": 8,
      "sub": 12,
      "photo": 5,
      "treasure": 3,
      "missions": 4
    }
  },
  {
    "id": 2,
    "externalKey": "changdeokgung",
    "title": "창덕궁 탐험",
    "description": "유네스코 세계문화유산 창덕궁 투어",
    "thumbnailUrl": "https://s3.../thumb2.jpg",
    "estimatedDurationMin": 120,
    "accessStatus": "LOCKED",
    "tags": [],
    "counts": { "main": 10, "sub": 5, "photo": 2, "treasure": 0, "missions": 5 }
  }
]
```

### 4.2 투어 디테일
`GET` **/api/v1/tours/{tourId}**

지도에 표시할 모든 스팟(mapSpots)과 현재 진행 중인 Run의 상세 진척도(currentRun)를 포함합니다. mapSpots에는 썸네일과 하이라이트 여부가 포함됩니다.

#### Path Parameters
| 이름 | 타입 | 설명 |
| --- | --- | --- |
| tourId | long | 투어 ID |

#### Response 200
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
    "secondaryButton": "GPS_TO_START",
    "moreActions": ["RESTART"]
  }
}
```

### 4.3 Unlock
`POST` **/api/v1/tours/{tourId}/access/unlock**

- **Authorization**: `Bearer <accessToken>`

유료/잠금 투어의 접근 권한을 해제합니다.

#### Response 200 (Empty Body)

### 4.4 Run 처리 (시작/재개)
`POST` **/api/v1/tours/{tourId}/runs**

- **Authorization**: `Bearer <accessToken>`
- **Content-Type**: `application/json`

투어를 시작하거나 재개합니다. Query Parameter 대신 Body를 사용합니다.

#### Request Body
```json
{
  "mode": "START"
}
```
| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| mode | string | O | START |

#### Response 200
```json
{
  "runId": 101,
  "tourId": 1,
  "status": "IN_PROGRESS",
  "mode": "START",
  "progress": {
    "completedCount": 0,
    "totalCount": 8,
    "completedSpotIds": []
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

### 4.5 근접 감지 (Proximity)
`POST` **/api/v1/tour-runs/{runId}/proximity**

- **Authorization**: `Bearer <accessToken>`
- **Content-Type**: `application/json`

사용자 위치를 기반으로 근처 스팟 이벤트를 감지합니다. 가이드가 있는 경우 단일 메시지 객체와 자동 진행(AUTO_NEXT) 액션을 반환하여 클라이언트에서 연속적인 가이드를 재생합니다.

#### Request Body
```json
{
  "lat": 37.5796,
  "lng": 126.9769
}
```

#### Response 200 (가이드 시작)
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
    "text": "광화문에 오신 것을 환영합니다.",
    "assets": [
       { "id": 1, "type": "IMAGE", "url": "https://s3.../image.jpg" }
    ],
    "delayMs": 1500,
    "action": {
      "type": "AUTO_NEXT",
      "nextApi": "/api/v1/chat-sessions/201/turns/502"
    }
  }
}
```

#### Client Logic (Auto-Next Flow)
1. 진입: `POST /proximity` 호출.
2. 렌더링: `message.text`와 `assets` 표시.
3. 대기: `delayMs` (ms) 만큼 대기.
4. 다음 요청: `action.type`이 `AUTO_NEXT`이면 `GET {action.nextApi}` 호출 (3.6 API 참조).
5. 반복: 더 이상 `AUTO_NEXT`가 없을 때까지 반복.

#### Response 200 (Treasure/Photo)
보물이나 포토 스팟 발견 시 message는 null일 수 있습니다.
```json
{
  "event": "TREASURE_FOUND",
  "contentType": "TREASURE_ALARM",
  "sessionId": null,
  "context": { 
    "refType": "SPOT", 
    "refId": 9, 
    "placeName": "비밀의 문", 
    "spotType": "TREASURE" 
  },
  "message": null
}
```

### 4.6 가이드 연속 재생 (Next Turn)
`GET` **/api/v1/chat-sessions/{sessionId}/turns/{nextTurnId}**

- **Authorization**: `Bearer <accessToken>`

PROXIMITY 또는 이전 턴의 nextApi를 통해 호출되어 가이드를 이어서 재생합니다.

#### Response 200
```json
{
  "turnId": 502,
  "role": "GUIDE",
  "text": "이곳은 경복궁의 정문으로 태조 때 창건되었습니다.",
  "delayMs": 2000,
  "action": {
    "type": "AUTO_NEXT",
    "nextApi": "/api/v1/chat-sessions/201/turns/503"
  }
}
```
마지막 턴의 경우 `action`은 `MISSION_CHOICE`가 되거나 `null`이 됩니다.

### 4.7 채팅 세션 조회
`GET` **/api/v1/tour-runs/{runId}/spots/{spotId}/chat-session**

- **Authorization**: `Bearer <accessToken>`

세션 상태와 함께 복구용 ID를 반환합니다.

#### Response 200
```json
{
  "sessionId": 201,
  "status": "ACTIVE",
  "lastTurnId": 505
}
```

### 4.8 채팅 히스토리
`GET` **/api/v1/chat-sessions/{sessionId}/turns**

- **Authorization**: `Bearer <accessToken>`

이전 대화 내역과 중단된 가이드 이어듣기 정보를 포함합니다.

#### Response 200
```json
{
  "sessionId": 201,
  "status": "ACTIVE",
  "nextScriptApi": "/api/v1/chat-sessions/201/turns/502", 
  "hasNextScript": true,
  "turns": [
    {
      "turnId": 501,
      "role": "GUIDE",
      "source": "SCRIPT",
      "text": "광화문에 오신 것을 환영합니다.",
      "assets": [
        { "id": 1, "type": "IMAGE", "url": "https://s3.../image.jpg" }
      ],
      "delayMs": 2000, 
      "action": {
        "type": "AUTO_NEXT",
        "nextApi": "/api/v1/chat-sessions/201/turns/502"
      },
      "createdAt": "2026-02-11T10:30:00"
    }
  ]
}
```
| 필드 | 설명 |
| --- | --- |
| nextScriptApi | 앱 재진입 시 중단된 시점부터 가이드를 다시 시작할 URL |
| hasNextScript | 남은 가이드 스크립트 존재 여부 |

### 4.9 채팅 메시지 전송
`POST` **/api/v1/chat-sessions/{sessionId}/messages**

- **Authorization**: `Bearer <accessToken>`
- **Content-Type**: `application/json`

사용자 질문에 대한 AI 답변과 함께, 질문 후 다시 가이드로 돌아갈 수 있는 링크를 제공합니다.

#### Request Body
```json
{
  "text": "이 건물의 역사가 궁금해요"
}
```

#### Response 200
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

### 4.10 스팟 상세 (Place/Treasure)
`GET` **/api/v1/spots/{spotId}**

- **인증**: 불필요

스팟의 기본 정보입니다. 위치 정보 필드가 lat, lng로 통일되었습니다.

#### Response 200
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

### 4.11 스팟 가이드 (전체 조회)
`GET` **/api/v1/spots/{spotId}/guide**

- **Authorization**: `Bearer <accessToken>`

스팟 가이드 전체 세그먼트를 조회합니다. media 필드가 assets로 변경되었습니다.

#### Response 200
```json
{
  "stepId": 1,
  "stepTitle": "광화문 가이드",
  "nextAction": "MISSION_CHOICE",
  "segments": [
    {
      "id": 10,
      "segIdx": 1,
      "text": "광화문에 오신 것을 환영합니다! 이곳은 경복궁의 정문입니다.",
      "assets": [
        { "id": 1, "type": "IMAGE", "url": "https://s3.../image1.jpg" }
      ],
      "delayMs": 2000
    },
    {
      "id": 11,
      "segIdx": 2,
      "text": "태조 시대에 처음 건립되었으며, 여러 번의 재건을 거쳤습니다.",
      "assets": [],
      "delayMs": 2500
    }
  ]
}
```

### 4.12 미션 스텝 상세
`GET` **/api/v1/content-steps/{stepId}/mission**

- **Authorization**: `Bearer <accessToken>`

미션 UI 구성을 위한 정보를 조회합니다.

#### Response 200
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

### 4.13 미션 제출
`POST` **/api/v1/tour-runs/{runId}/steps/{stepId}/missions/submit**

- **Authorization**: `Bearer <accessToken>`
- **Content-Type**: `application/json`

미션을 제출하고 결과를 확인합니다. 성공 시 다음 장소 안내를 위한 API를 반환합니다.

#### Request Body
```json
{
  "missionType": "QUIZ",
  "userInput": null,
  "photoUrl": null,
  "selectedOptionId": "A"
}
```
| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| missionType | string | O | QUIZ, OX, PHOTO, TEXT_INPUT |
| selectedOptionId | string | X | 객관식/OX 선택지 ID |
| userInput | string | X | 텍스트 입력 |
| photoUrl | string | X | 사진 URL |

#### Response 200
```json
{
  "attemptId": 102,
  "success": true,
  "isCorrect": true,
  "score": 100,
  "feedback": "광화문의 잡상은 총 7개입니다! 정확히 맞히셨어요.",
  "nextStepApi": "/api/v1/tour-runs/10/next-spot"
}
```

---

## 5. 수집 API (Place·Treasure·Photo Spot)

### 5.1 Place Collection
`GET` **/api/v1/collections/places**

- **Authorization**: `Bearer <accessToken>`

#### Response 200
```json
{
  "totalCollected": 12,
  "items": [
    {
      "spotId": 1,
      "title": "광화문",
      "collectedAt": "2026-02-14T10:30:00",
      "collected": true
    }
  ]
}
```

### 5.2 Treasure Collection
`GET` **/api/v1/collections/treasures**

- **Authorization**: `Bearer <accessToken>`

### 5.3 Photo Spot

#### 포토 스팟 목록
`GET` **/api/v1/photo-spots**

#### 포토 제출
`POST` **/api/v1/photo-spots/{spotId}/submissions**

- **Authorization**: `Bearer <accessToken>`
