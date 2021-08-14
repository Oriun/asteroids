export function Point(x, y) {
    this.x = x
    this.y = y
    this.toString = () => '(' + this.x + ';' + this.y + ')'
    this.clone = () => new Point(x, y)
}

export function Segment(pointA, pointB, precision = .01) {
    this.p1 = pointA.clone()
    this.p2 = pointB.clone()
    this.calculate = () => {
        var spanX = pointB.x - pointA.x
        this.spanY = pointB.y - pointA.y
        if (!spanX) {
            this.vertical = true
            this.x = this.p1.x
            this.a = 0
            this.b = 0
            this.equation = (point) => Math.abs(point.x - this.p1.x) < precision
            this.toString = () => 'x=' + this.p1.x
        } else if (!this.spanY) {
            this.horizontal = true
            this.y = this.p1.y
            this.a = 0
            this.b = 0
            this.equation = (point) => Math.abs(this.p1.y - point.y) < precision
            this.toString = () => 'y=' + this.p1.y
        } else {
            this.a = this.spanY / spanX
            this.b = this.p2.y - this.a * this.p2.x
            this.equation = (point) => Math.abs(point.x * this.a + this.b - point.y) < precision
            this.toString = () => 'y=' + this.a + 'x+' + this.b
        }
    }
    this.calculate()
    this.isInside = point => {
        if (!this.equation(point)) return false
        if (this.spanY < 0 && !(point.y < this.p1.y ^ point.y < this.p2.y)) return false
        if (this.spanY > 0 && !(point.y > this.p1.y ^ point.y > this.p2.y)) return false
        return Boolean(point.x > this.p1.x ^ point.x > this.p2.x)
    }
    this.handleNonAffine = (droite) => {
        if (!(droite.horizontal || droite.vertical || this.horizontal || this.vertical)) return false
        else if (this.horizontal) {
            if (droite.horizontal) {
                return droite.y === this.y
            } else if (droite.vertical) {
                let intersect = new Point(droite.x, this.y)
                return this.isInside(intersect) && droite.isInside(intersect)
            } else {
                let c0 = droite.p1.y > this.y ^ droite.p2.y > this.y
                if (!c0) return false
                let x = (this.y - droite.b) / droite.a
                return Boolean(this.p1.x > x ^ this.p2.x > x)
            }
        } else if (this.vertical) {
            if (droite.vertical) {
                return droite.x === this.x
            } else if (droite.horizontal) {
                let intersect = new Point(this.x, droite.y)
                return this.isInside(intersect) && droite.isInside(intersect)
            } else {
                let c0 = this.x > droite.p1.x ^ this.x > droite.p2.x
                if (!c0) return false
                let y = droite.a * this.x + droite.b
                return Boolean(this.p1.y > y ^ this.p2.y > y)
            }
        } else {
            return droite.handleNonAffine(this)
        }
    }
    this.intersect = (droite) => {
        if (droite.horizontal || droite.vertical || this.horizontal || this.vertical) {
            return this.handleNonAffine(droite)
        } else {
            if (droite.a === this.a) return false
            var x = (this.b - droite.b) / (droite.a - this.a)
            var y = x * this.a + this.b
            var intersect = new Point(x, y)
            return this.isInside(intersect) && droite.isInside(intersect)
        }
    }
    this.translate = (x, y) => {
        // console.log('translate', x, y, this.p1.toString(), this.p2.toString())
        this.p1.x += x
        this.p1.y += y
        this.p2.x += x
        this.p2.y += y
        if (Number.isNaN(this.p1.x)) throw new Error(this.p1.toString())
        if (Number.isNaN(this.p2.x)) throw new Error(this.p2.toString())
        // console.assert(!Number.isNaN(this.p2.x), throw new Error())
        if (this.a) {
            this.b += y - this.a / x
        } else if (this.x) {
            this.x += x
        } else if (this.y) {
            this.y += y
        }
        // console.log(this.p1.toString(), this.p2.toString())
    }
    this.rotate = (o, angle) => {
        var newP1 = rotateAround(o, angle, this.p1)
        var newP2 = rotateAround(o, angle, this.p2)
        console.assert(!Number.isNaN(newP1) || !Number.isNaN(newP2), 'Rotation failed with NaN : ', o, angle, this.p1.toString(), this.p2.toString())
        this.calculate()
    }
}

export function Polygon(center, ...points) {
    var p = points.flat()
    if (p.length < 3) throw new Error('Not enough points to create a polygon')
    // this.points = p
    this.center = center
    this.droite = []
    this.droite.push(new Segment(p[0], p[p.length - 1]))
    for (let i = 1; i < p.length; i++) {
        this.droite.push(new Segment(p[i], p[i - 1]))
    }
    this.intersectDroite = droite => this.droite.some(z => z.intersect(droite))
    this.intersect = polygon => this.droite.some((z, i) => {
        var sss = polygon.droite.map(droite => z.intersect(droite))
        console.log(sss, z.p1.toString(), z.p2.toString(), polygon.droite.map(d => d.p1.toString() + d.p2.toString()))
        if (sss.filter(Boolean).length) return true
        return false
    })
    this.translate = (x, y) => this.droite.forEach(a => a.translate(x, y))
    this.rotate = (angle, o) => this.droite.forEach(d => d.rotate(o || this.center, angle))
}

export function rotateAround(origin, angle, point) {
    var a = -1 * angle
    var s = Math.sin(a);
    var c = Math.cos(a);

    var x = point.x - origin.x;
    var y = point.y - origin.y;

    var xnew = x * c - y * s;
    var ynew = x * s + y * c;

    x = xnew + origin.x;
    y = ynew + origin.y;

    return new Point(x, y);
}

export function Rectangle(width = 0, height = 0) {
    return new Polygon(
        new Point(width * .5, height * .5),
        new Point(0, 0),
        new Point(width, 0),
        new Point(width, height),
        new Point(0, height)
    )
}

export default Polygon

// var ship = new Polygon(
//     new Point(46, 250),
//     new Point(11, 215),
//     new Point(11, 285),
//     new Point(81, 215),
//     new Point(81, 285)
// )

// ship.translate(10,10)

// var asteroid = new Rectangle(100, 100)

// asteroid.translate(16.51024357327987, 198.1449842434483)

// console.log(asteroid.droite)

// console.log(
//     ship.intersect(asteroid)
// )