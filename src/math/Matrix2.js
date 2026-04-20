// Phaser has no Matrix2 class so this will substitute for its absence
export class Matrix2 {
    static rotationMatrix(angleRadians) {
        const cos = Math.cos(angleRadians);
        const sin = Math.sin(angleRadians);
        return new Matrix2(cos, -sin, sin, cos);
    }

    constructor(topLeft, topRight, bottomLeft, bottomRight) {
        this.topLeft = topLeft;
        this.topRight = topRight;
        this.bottomLeft = bottomLeft;
        this.bottomRight = bottomRight;
    }

    // Gets X component from multiplying a vector, dot product with matrix's X-row
    multiplyVectorX(x, y) {
        return x * this.topLeft + y * this.topRight;
    }

    // Gets Y component from multiplying a vector, dot product with matrix's Y-row
    multiplyVectorY(x, y) {
        return x * this.bottomLeft + y * this.bottomRight;
    }

    transpose() {
        [ this.bottomLeft, this.topRight ] = [ this.topRight, this.bottomLeft ];
    }
}
