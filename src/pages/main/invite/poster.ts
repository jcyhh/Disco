interface InvitationPosterOptions {
    backgroundUrl: string
    treasureUrl: string
    dividerUrl: string
    title: string
    subtitle: string
    codeLabel: string
    linkLabel: string
    footer: string
    code: string
    link: string
}

function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = () => reject(new Error('Invitation artwork could not be loaded'))
        image.src = url
    })
}

function wrapText(context: CanvasRenderingContext2D, text: string, width: number): string[] {
    const lines: string[] = []
    let current = ''
    for (const character of text) {
        const candidate = current + character
        if (current && context.measureText(candidate).width > width) {
            lines.push(current)
            current = character
        } else {
            current = candidate
        }
    }
    if (current) lines.push(current)
    return lines
}

function setFont(context: CanvasRenderingContext2D, size: number, weight = 400) {
    context.font = `${weight} ${size}px system-ui, sans-serif`
}

function goldGradient(context: CanvasRenderingContext2D, top: number, height: number) {
    const gradient = context.createLinearGradient(0, top, 0, top + height)
    gradient.addColorStop(0.20673, '#fff6b8')
    gradient.addColorStop(0.86058, '#f1b965')
    return gradient
}

function roundedBox(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    context.beginPath()
    context.roundRect(x, y, width, height, radius)
}

function drawLines(context: CanvasRenderingContext2D, lines: string[], x: number, y: number, lineHeight: number) {
    lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight))
}

/** Compose a shareable poster from local artwork and referral text; no page capture or upload. */
export async function createInvitationPoster(options: InvitationPosterOptions): Promise<Blob> {
    const [background, treasure, divider] = await Promise.all([
        loadImage(options.backgroundUrl),
        loadImage(options.treasureUrl),
        loadImage(options.dividerUrl),
    ])
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas is unavailable')

    setFont(context, 80, 700)
    const titleLines = wrapText(context, options.title, 630)
    setFont(context, 28)
    const subtitleLines = wrapText(context, options.subtitle, 630)
    const codeLabelLines = wrapText(context, options.codeLabel, 570)
    const linkLabelLines = wrapText(context, options.linkLabel, 570)
    setFont(context, 24)
    const linkLines = wrapText(context, options.link, 570)
    setFont(context, 20)
    const footerLines = wrapText(context, options.footer, 390)

    const titleTop = 647
    const subtitleTop = titleTop + titleLines.length * 112 + 6
    const cardTop = subtitleTop + subtitleLines.length * 42 + 30
    const codeLabelTop = cardTop + 30
    const codeBoxTop = codeLabelTop + codeLabelLines.length * 42 + 20
    const linkLabelTop = codeBoxTop + 98 + 30
    const linkBoxTop = linkLabelTop + linkLabelLines.length * 42 + 20
    const linkBoxHeight = Math.max(80, linkLines.length * 36 + 32)
    const footerTop = linkBoxTop + linkBoxHeight + 50
    const cardBottom = footerTop + footerLines.length * 28 + 40
    canvas.width = 750
    canvas.height = Math.max(1536, cardBottom + 100)

    context.fillStyle = '#200946'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.save()
    context.beginPath()
    context.rect(0, 0, 750, 1536)
    context.clip()
    context.drawImage(background, -0.15, -7.5264, 750.3, 1622.016)
    const backgroundFade = context.createLinearGradient(0, 0, 0, 1536)
    backgroundFade.addColorStop(0.95, 'rgba(32,9,70,0)')
    backgroundFade.addColorStop(1, '#200946')
    context.fillStyle = backgroundFade
    context.fillRect(0, 0, 750, 1536)
    context.restore()
    const treasureScale = Math.max(750 / treasure.width, 600 / treasure.height)
    const treasureWidth = treasure.width * treasureScale
    const treasureHeight = treasure.height * treasureScale
    context.save()
    context.beginPath()
    context.rect(0, 124, 750, 600)
    context.clip()
    context.drawImage(treasure, (750 - treasureWidth) / 2, 124 + (600 - treasureHeight) / 2, treasureWidth, treasureHeight)
    context.restore()

    context.textBaseline = 'top'
    context.textAlign = 'center'
    context.fillStyle = goldGradient(context, titleTop, titleLines.length * 112)
    context.shadowColor = '#240f46'
    context.shadowBlur = 20
    setFont(context, 80, 700)
    drawLines(context, titleLines, 375, titleTop, 112)
    setFont(context, 28)
    context.fillStyle = goldGradient(context, subtitleTop, subtitleLines.length * 42)
    drawLines(context, subtitleLines, 375, subtitleTop, 42)
    context.shadowBlur = 0

    roundedBox(context, 30, cardTop, 690, cardBottom - cardTop, 20)
    context.fillStyle = 'rgba(93,70,132,0.8)'
    context.fill()
    context.lineWidth = 2
    context.strokeStyle = '#ff05da'
    context.stroke()
    context.textAlign = 'left'
    context.fillStyle = '#ffffff'
    setFont(context, 28)
    drawLines(context, codeLabelLines, 60, codeLabelTop, 42)
    roundedBox(context, 60, codeBoxTop, 630, 98, 20)
    context.fillStyle = 'rgba(32,9,70,0.2)'
    context.fill()
    context.strokeStyle = 'rgba(255,255,255,0.4)'
    context.lineWidth = 1
    context.stroke()
    setFont(context, 52, 600)
    context.fillStyle = goldGradient(context, codeBoxTop + 12, 72)
    context.fillText(options.code, 90, codeBoxTop + 12)
    context.fillStyle = '#ffffff'
    setFont(context, 28)
    drawLines(context, linkLabelLines, 60, linkLabelTop, 42)
    roundedBox(context, 60, linkBoxTop, 630, linkBoxHeight, 20)
    context.fillStyle = 'rgba(32,9,70,0.4)'
    context.fill()
    context.strokeStyle = 'rgba(246,238,255,0.2)'
    context.lineWidth = 2
    context.stroke()
    context.fillStyle = '#dba5ff'
    setFont(context, 24)
    drawLines(context, linkLines, 80, linkBoxTop + 16, 36)
    context.textAlign = 'center'
    setFont(context, 20)
    context.fillStyle = goldGradient(context, footerTop, footerLines.length * 28)
    drawLines(context, footerLines, 375, footerTop, 28)

    // Preserve the design's cropped divider slots on either side of the footer.
    const dividerTop = footerTop + (footerLines.length * 28 - 16) / 2
    const footerWidth = Math.max(...footerLines.map((line) => context.measureText(line).width), 0)
    const leftDivider = (750 - footerWidth - 200) / 2
    for (const side of [-1, 1]) {
        const x = side < 0 ? leftDivider : leftDivider + footerWidth + 120
        context.save()
        context.beginPath()
        context.rect(x, dividerTop, 80, 16)
        context.clip()
        if (side > 0) {
            context.translate(x + 80, dividerTop)
            context.scale(-1, 1)
        } else {
            context.translate(x, dividerTop)
        }
        context.drawImage(divider, -60.352, -16, 252.328, 82.8576)
        context.restore()
    }

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Invitation poster could not be encoded'))
        }, 'image/png')
    })
}
