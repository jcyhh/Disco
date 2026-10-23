import { createElement, useMemo, type ReactNode } from 'react'
import { resolveApiAssetUrl } from '@/features/integration/assetUrl.ts'
import './NoticeContent.scss'

const ALLOWED_TAGS = new Set(['p', 'div', 'span', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'hr', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td'])
const DROP_TAGS = new Set(['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math', 'form', 'input', 'button', 'link', 'meta'])

function renderNode(node: Node, key: number): ReactNode {
    if (node.nodeType === 3) return node.textContent
    if (node.nodeType !== 1) return null
    const element = node as Element
    const tag = element.tagName.toLowerCase()
    if (DROP_TAGS.has(tag)) return null
    const children = Array.from(element.childNodes).map(renderNode)
    if (!ALLOWED_TAGS.has(tag)) return children
    if (tag === 'img') {
        const src = resolveApiAssetUrl(element.getAttribute('src') ?? '')
        return src ? <img key={key} src={src} alt={element.getAttribute('alt') ?? ''} loading="lazy" /> : null
    }
    if (tag === 'a') {
        const href = resolveApiAssetUrl(element.getAttribute('href') ?? '')
        return href ? <a key={key} href={href} target="_blank" rel="noopener noreferrer">{children}</a> : children
    }
    return createElement(tag, { key }, tag === 'br' || tag === 'hr' ? undefined : children)
}


export function NoticeContent({ content }: { content: string }) {
    const nodes = useMemo(() => Array.from(new DOMParser().parseFromString(content, 'text/html').body.childNodes).map(renderNode), [content])
    return <div className="notice-content">{nodes}</div>
}
