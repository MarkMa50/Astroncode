/**
 * Network Utilities Index
 *
 * This module provides centralized exports for network-related operations.
 * Import from 'src/utils/network/index.js' for organized access.
 *
 * @module utils/network
 */

// HTTP utilities
export {
  httpGet,
  httpPost,
  httpPut,
  httpDelete,
  httpRequest,
  type HttpRequestOptions,
  type HttpResponse,
} from '../http.js'

// API client
export {
  ApiClient,
  getApiClient,
  setApiClient,
  type ApiClientOptions,
  type ApiResponse,
} from '../api.js'

// Proxy configuration
export {
  getProxyConfig,
  setProxyConfig,
  getProxyAgent,
  type ProxyConfig,
} from '../proxy.js'

// CA certificates
export {
  getCaCerts,
  loadCaCerts,
  getCaCertPath,
  type CaCertConfig,
} from '../caCerts.js'

// mTLS utilities
export {
  getMtlsConfig,
  loadMtlsCerts,
  type MtlsConfig,
} from '../mtls.js'

// Peer address
export {
  getPeerAddress,
  parsePeerAddress,
  type PeerAddress,
} from '../peerAddress.js'

// WebSocket transport
export {
  createWebSocketTransport,
  WebSocketTransport,
  type WebSocketOptions,
} from '../mcpWebSocketTransport.js'

// Browser utilities
export {
  openBrowser,
  getBrowserPath,
  isBrowserAvailable,
} from '../browser.js'
