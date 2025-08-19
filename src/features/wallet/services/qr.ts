
export interface QRCodeOptions {
  size?: number
  margin?: number
  darkColor?: string
  lightColor?: string
}

export interface QRCodeService {
  generateQRCodeSVG(text: string, options?: QRCodeOptions): string
  generatePaymentQR(address: string, amount?: string, token?: string): string
}

class QRCodeServiceImpl implements QRCodeService {
  
  generateQRCodeSVG(text: string, options: QRCodeOptions = {}): string {
    const {
      size = 200,
      margin = 4,
      darkColor = '#000000',
      lightColor = '#ffffff'
    } = options

    // Simple QR code matrix generation (mock implementation)
    const matrix = this.generateQRMatrix(text)
    const moduleSize = (size - 2 * margin) / matrix.length
    
    let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`
    
    // Background
    svg += `<rect width="${size}" height="${size}" fill="${lightColor}"/>`
    
    // QR modules
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col]) {
          const x = margin + col * moduleSize
          const y = margin + row * moduleSize
          svg += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="${darkColor}"/>`
        }
      }
    }
    
    svg += '</svg>'
    return svg
  }

  generatePaymentQR(address: string, amount?: string, token?: string): string {
    // Create payment URI
    let paymentUri = `substrate:${address}`
    
    const params: string[] = []
    if (amount) params.push(`amount=${amount}`)
    if (token) params.push(`token=${token}`)
    
    if (params.length > 0) {
      paymentUri += '?' + params.join('&')
    }
    
    return this.generateQRCodeSVG(paymentUri, {
      size: 250,
      margin: 6
    })
  }

  private generateQRMatrix(text: string): boolean[][] {
    // This is a simplified mock QR code generator
    // In a real implementation, you'd use a proper QR code library
    
    const size = 25 // QR code version 1 is 21x21, we'll use 25x25 for simplicity
    const matrix: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false))
    
    // Generate a pattern based on the text hash
    const hash = this.simpleHash(text)
    
    // Finder patterns (corners)
    this.addFinderPattern(matrix, 0, 0)
    this.addFinderPattern(matrix, 0, size - 7)
    this.addFinderPattern(matrix, size - 7, 0)
    
    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
      matrix[6][i] = i % 2 === 0
      matrix[i][6] = i % 2 === 0
    }
    
    // Data modules (simplified pattern based on hash)
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (!this.isReservedArea(row, col, size)) {
          // Use hash to determine if module should be dark
          const index = row * size + col
          matrix[row][col] = ((hash + index) % 3) === 0
        }
      }
    }
    
    return matrix
  }

  private addFinderPattern(matrix: boolean[][], startRow: number, startCol: number): void {
    // 7x7 finder pattern
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        const r = startRow + row
        const c = startCol + col
        
        if (r >= 0 && r < matrix.length && c >= 0 && c < matrix[0].length) {
          // Outer border and center
          if (row === 0 || row === 6 || col === 0 || col === 6 || 
              (row >= 2 && row <= 4 && col >= 2 && col <= 4)) {
            matrix[r][c] = true
          }
        }
      }
    }
  }

  private isReservedArea(row: number, col: number, size: number): boolean {
    // Finder patterns
    if ((row < 9 && col < 9) || 
        (row < 9 && col >= size - 8) || 
        (row >= size - 8 && col < 9)) {
      return true
    }
    
    // Timing patterns
    if (row === 6 || col === 6) {
      return true
    }
    
    return false
  }

  private simpleHash(text: string): number {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }
}

// Export singleton instance
export const qrService = new QRCodeServiceImpl()