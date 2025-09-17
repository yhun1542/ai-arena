// lib/logger.js - 운영 로깅 시스템
import { randomUUID } from 'crypto';

/**
 * 이벤트 표준 (합의안)
 * - DISCUSSION_CREATED / DISCUSSION_CREATE_FAILED
 * - SEARCH_BAD_INPUT / SEARCH_BAD_METHOD / SEARCH_BAD_CONTENT_TYPE  
 * - STREAM_STARTED / STREAM_CHUNK_SENT / STREAM_COMPLETED / STREAM_ERROR / STREAM_ABORTED
 * 
 * 필드 공통: ts, level, event, reqId, route, method, durationMs?, status?
 */

class Logger {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.samplingRate = {
      success: 0.1, // 성공 로그 10% 샘플링
      error: 1.0    // 에러 100%
    };
  }

  /**
   * 상관관계ID 생성 및 관리
   */
  generateRequestId() {
    return randomUUID();
  }

  /**
   * PII 민감정보 차단 및 안전한 로그 생성
   */
  sanitizeData(data) {
    if (!data) return null;
    
    // 본문 전체 저장 금지, 길이·유형만 기록
    if (typeof data === 'string') {
      return {
        type: 'string',
        length: data.length,
        preview: data.length > 100 ? `${data.substring(0, 100)}...` : data
      };
    }
    
    if (typeof data === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(data)) {
        // PII 필드 차단
        if (['password', 'token', 'secret', 'key', 'auth'].some(pii => 
          key.toLowerCase().includes(pii))) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'string' && value.length > 1000) {
          // 긴 문자열은 길이만 기록
          sanitized[key] = {
            type: 'string',
            length: value.length,
            truncated: true
          };
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    }
    
    return data;
  }

  /**
   * 샘플링 결정 (성공 10%, 에러 100%)
   */
  shouldLog(level) {
    if (level === 'error') return true;
    if (level === 'info' || level === 'success') {
      return Math.random() < this.samplingRate.success;
    }
    return true;
  }

  /**
   * 구조화된 로그 출력 (JSON 라인 형식)
   */
  log(level, event, data = {}) {
    if (!this.shouldLog(level)) return;

    const logEntry = {
      ts: new Date().toISOString(),
      level,
      event,
      reqId: data.reqId || this.generateRequestId(),
      route: data.route || null,
      method: data.method || null,
      ...(data.durationMs && { durationMs: data.durationMs }),
      ...(data.status && { status: data.status }),
      ...(data.error && { error: this.sanitizeData(data.error) }),
      ...(data.payload && { payload: this.sanitizeData(data.payload) })
    };

    // JSON 라인 형식으로 출력
    console.log(JSON.stringify(logEntry));
  }

  // 편의 메서드들
  info(event, data) {
    this.log('info', event, data);
  }

  error(event, data) {
    this.log('error', event, data);
  }

  warn(event, data) {
    this.log('warn', event, data);
  }

  // 표준 이벤트 로거들
  discussionCreated(reqId, route, method, durationMs, payload) {
    this.info('DISCUSSION_CREATED', {
      reqId, route, method, durationMs,
      status: 201,
      payload
    });
  }

  discussionCreateFailed(reqId, route, method, durationMs, error) {
    this.error('DISCUSSION_CREATE_FAILED', {
      reqId, route, method, durationMs,
      status: 500,
      error
    });
  }

  searchBadInput(reqId, route, method, error) {
    this.warn('SEARCH_BAD_INPUT', {
      reqId, route, method,
      status: 400,
      error
    });
  }

  searchBadMethod(reqId, route, method) {
    this.warn('SEARCH_BAD_METHOD', {
      reqId, route, method,
      status: 405
    });
  }

  searchBadContentType(reqId, route, method, contentType) {
    this.warn('SEARCH_BAD_CONTENT_TYPE', {
      reqId, route, method,
      status: 415,
      error: { receivedContentType: contentType }
    });
  }

  streamStarted(reqId, route, method) {
    this.info('STREAM_STARTED', {
      reqId, route, method,
      status: 200
    });
  }

  streamChunkSent(reqId, route, method, chunkSize) {
    this.info('STREAM_CHUNK_SENT', {
      reqId, route, method,
      payload: { chunkSize }
    });
  }

  streamCompleted(reqId, route, method, durationMs, totalChunks) {
    this.info('STREAM_COMPLETED', {
      reqId, route, method, durationMs,
      status: 200,
      payload: { totalChunks }
    });
  }

  streamError(reqId, route, method, durationMs, error) {
    this.error('STREAM_ERROR', {
      reqId, route, method, durationMs,
      status: 500,
      error
    });
  }

  streamAborted(reqId, route, method, durationMs) {
    this.warn('STREAM_ABORTED', {
      reqId, route, method, durationMs,
      status: 499
    });
  }
}

// 싱글톤 인스턴스
const logger = new Logger();

export default logger;

/**
 * Express 미들웨어 - 모든 응답에 x-request-id 헤더 추가
 */
export function requestIdMiddleware(req, res, next) {
  const requestId = logger.generateRequestId();
  req.requestId = requestId;
  
  // 모든 응답에 x-request-id 헤더 필수
  res.setHeader('x-request-id', requestId);
  
  // 요청 시작 로그
  const startTime = Date.now();
  req.startTime = startTime;
  
  logger.info('REQUEST_STARTED', {
    reqId: requestId,
    route: req.path,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  // 응답 완료 시 로그
  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const level = res.statusCode >= 400 ? 'error' : 'info';
    
    logger.log(level, 'REQUEST_COMPLETED', {
      reqId: requestId,
      route: req.path,
      method: req.method,
      status: res.statusCode,
      durationMs
    });
  });

  next();
}
