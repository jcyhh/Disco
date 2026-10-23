export function noticePlainText(content: string): string {
    return new DOMParser().parseFromString(content, 'text/html').body.textContent ?? ''
}
