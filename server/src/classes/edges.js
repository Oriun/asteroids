export function Point(x, y) {
    this.x = x
    this.y = y
    this.toString = () => '(' + this.x + ';' + this.y + ')'
    this.clone = () => new Point(x, y)
}

export function Rectangle(pointA, pointB) {
    var p1 = pointA.clone()
    var p2 = pointB.clone()
    this.calculate = () => {
        this.spanX = [p1.x, p2.x].sort((a, b) => a - b)
        this.spanY = [p1.y, p2.y].sort((a, b) => a - b)
    }
    this.calculate()
    this.rotate = (o, a) => {
        p1 = rotateAround(o, a, p1)
        p2 = rotateAround(o, a, p2)
        this.calculate()
    }
    this.clone = () => new Rectangle(p1, p2)
    this.translate = (x, y) => {
        p1.x += x
        p1.y += y
        p2.x += x
        p2.y += y
        this.calculate()
    }
}

export function intersect(polygonA, polygonB) {
    var x = polygonA.spanX[0] <= polygonB.spanX[1] && polygonA.spanX[1] >= polygonB.spanX[0]
    var y = polygonA.spanY[0] <= polygonB.spanY[1] && polygonA.spanY[1] >= polygonB.spanY[0]
    return x && y
}
// export function Triangle(pointA, pointB, pointC) {
//     var p1 = pointA.clone()
//     var p2 = pointB.clone()
//     var p3 = pointC.clone()
//     this.calculate = () => {
//         this.spanX = [p1.x, p2.x, p3.x].sort((a, b) => a - b)
//         this.spanX.splice(1, 1)
//         this.spanY = [p1.y, p2.y, p3.y].sort((a, b) => a - b)
//         this.spanY.splice(1, 1)
//     }
//     this.calculate()
//     this.rotate = (o, a) => {
//         p1 = rotateAround(o, a, p1)
//         p2 = rotateAround(o, a, p2)
//         p3 = rotateAround(o, a, p3)
//         this.calculate()
//     }
//     this.clone = () => new Triangle(p1, p2, p3)
// }

export function Edges(...edges) {
    this.edgesList = edges
    this.intersect = (otherEdges) => {
        return this.edgesList.some(a => otherEdges.edgesList.some(b => intersect(a, b)))
    }
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

export default Edges

// var rectA = new Rectangle(
//     new Point(0, 0),
//     new Point(4, 2)
// )
// var rectB = new Triangle(
//     new Point(4, 3),
//     new Point(8, 4),
//     new Point(5, 1)
// )

// console.log(intersect(rectA, rectB))