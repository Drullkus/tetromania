class Matrix2 {
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

    // Gets X component from multiplying a vector
    multiplyVectorX(x, y) {
        return x * this.topLeft + y * this.topRight;
    }

    // Gets Y component from multiplying a vector
    multiplyVectorY(x, y) {
        return x * this.bottomLeft + y * this.bottomRight;
    }

    transpose() {
        [ this.bottomLeft, this.topRight ] = [ this.topRight, this.bottomLeft ];
    }
}
