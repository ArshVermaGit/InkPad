/**
 * Simple 1D Perlin noise implementation for organic randomness
 */
class Perlin1D {
    p: number[];

    constructor() {
        this.p = new Array(512);
        const permutation = Array.from({ length: 256 }, (_, i) => i).sort(() => Math.random() - 0.5);
        for (let i = 0; i < 512; i++) {
            this.p[i] = permutation[i & 255];
        }
    }

    fade(t: number) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(t: number, a: number, b: number) {
        return a + t * (b - a);
    }

    grad(hash: number, x: number) {
        return (hash & 1 ? x : -x);
    }

    noise(x: number) {
        const X = Math.floor(x) & 255;
        x -= Math.floor(x);
        const u = this.fade(x);
        return this.lerp(u, this.grad(this.p[X], x), this.grad(this.p[X + 1], x - 1)) * 2;
    }
}

export const noise = new Perlin1D();
