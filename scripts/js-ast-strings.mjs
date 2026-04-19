/**
 * js-ast-strings.mjs
 *
 * AST-level branding safety layer for minified JavaScript bundles.
 *
 * Problem: global regex replacements on bundle text hit HTTP headers,
 * SDK identifiers, object keys, and class names — breaking API calls.
 *
 * Solution: traverse the JS source with a state-machine tokenizer and
 * apply "catch-all" brand replacements ONLY to string literal VALUES.
 * Code structure, identifiers, comments, and regex literals are passed
 * through unchanged.
 *
 * No external dependencies. O(n) over source length.
 */

/**
 * Walk a JavaScript source string and call `transform` on the inner
 * content of every string literal (" ", ' ', ` `).
 *
 * Handles:
 *   - Double-quoted strings with backslash escapes
 *   - Single-quoted strings with backslash escapes
 *   - Template literals (static parts only — ${...} blocks are passed
 *     through without transformation to avoid corrupting expressions)
 *   - // line comments  (passed through unchanged)
 *   - /* block comments  (passed through unchanged)
 *
 * @param {string} source      Raw JS source text (may be minified)
 * @param {(content: string) => string} transform
 *   Called with the raw content between the string delimiters.
 *   Return the (possibly modified) replacement content.
 * @returns {string} Patched source
 */
export function transformJsStringLiterals(source, transform) {
  let result = ''
  let i = 0
  const len = source.length

  while (i < len) {
    const ch = source[i]

    // ── Line comment  // ... \n ──────────────────────────────────────
    if (ch === '/' && source[i + 1] === '/') {
      const nl = source.indexOf('\n', i)
      if (nl === -1) { result += source.slice(i); break }
      result += source.slice(i, nl + 1)
      i = nl + 1
      continue
    }

    // ── Block comment  /* ... */ ──────────────────────────────────────
    if (ch === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2)
      if (end === -1) { result += source.slice(i); break }
      result += source.slice(i, end + 2)
      i = end + 2
      continue
    }

    // ── Double-quoted string ─────────────────────────────────────────
    if (ch === '"') {
      i++ // skip opening "
      let content = ''
      while (i < len && source[i] !== '"') {
        if (source[i] === '\\') {
          content += source[i] + (source[i + 1] ?? '')
          i += 2
        } else {
          content += source[i++]
        }
      }
      result += '"' + transform(content) + (i < len ? '"' : '')
      i++ // skip closing "
      continue
    }

    // ── Single-quoted string ─────────────────────────────────────────
    if (ch === "'") {
      i++ // skip opening '
      let content = ''
      while (i < len && source[i] !== "'") {
        if (source[i] === '\\') {
          content += source[i] + (source[i + 1] ?? '')
          i += 2
        } else {
          content += source[i++]
        }
      }
      result += "'" + transform(content) + (i < len ? "'" : '')
      i++ // skip closing '
      continue
    }

    // ── Template literal  ` static ${expr} static ` ─────────────────
    // Strategy: transform static segments (outside ${...}), pass
    // expression segments through verbatim to avoid corrupting code.
    if (ch === '`') {
      result += '`'
      i++ // skip opening `
      let depth = 0 // nesting level of ${...} blocks

      while (i < len) {
        // Closing backtick at depth 0 ends the template literal
        if (source[i] === '`' && depth === 0) {
          result += '`'
          i++
          break
        }

        // Escape sequence — copy verbatim regardless of depth
        if (source[i] === '\\') {
          result += source[i] + (source[i + 1] ?? '')
          i += 2
          continue
        }

        // Opening expression  ${
        if (source[i] === '$' && source[i + 1] === '{') {
          result += '${'
          i += 2
          depth++
          continue
        }

        // Closing brace ends an expression block
        if (source[i] === '}' && depth > 0) {
          result += '}'
          i++
          depth--
          continue
        }

        if (depth === 0) {
          // Static segment: collect until ${, `, or \
          let seg = ''
          while (
            i < len &&
            !(source[i] === '`') &&
            !(source[i] === '\\') &&
            !(source[i] === '$' && source[i + 1] === '{')
          ) {
            seg += source[i++]
          }
          result += transform(seg)
        } else {
          // Inside ${...}: copy verbatim (code, not a string value)
          result += source[i++]
        }
      }
      continue
    }

    // ── Anything else: pass through ──────────────────────────────────
    result += ch
    i++
  }

  return result
}

/**
 * Safely apply Anthropic → Astron catch-all replacements to a JS bundle.
 *
 * Only replaces inside string literal values. Skips strings that look
 * like technical identifiers to avoid corrupting API infrastructure:
 *
 *   Skipped: "anthropic-version", "x-anthropic-id", "@anthropic-ai/sdk"
 *   Replaced: "Anthropic account", "Contact Anthropic", "by Anthropic"
 *
 * @param {string} source  Bundle text
 * @returns {string}       Patched bundle text
 */
export function applyAnthropicCatchAll(source) {
  return transformJsStringLiterals(source, content => {
    // Skip strings that are clearly technical identifiers:
    // HTTP header names:    "anthropic-version", "x-anthropic-*"
    // NPM package names:    "@anthropic-ai/sdk"
    // URL path segments:    "/anthropic/..."
    if (
      /anthropic[-/]/i.test(content) ||   // "anthropic-version", "anthropic/v1"
      /[-/]anthropic/i.test(content) ||   // "x-anthropic-id", "/anthropic"
      /^@anthropic/i.test(content)        // "@anthropic-ai/sdk"
    ) {
      return content
    }

    // Replace standalone "Anthropic" / "anthropic" in user-visible text
    return content
      .replace(/\bAnthropic\b/g, 'Astron')
      .replace(/\banthropic\b/g, 'astron')
  })
}
