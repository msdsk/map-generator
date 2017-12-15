/**
 * Application entry point
 */

// Load application styles
import 'styles/index.scss';
const d3 = Object.assign({}, require("d3-selection"), require("d3-voronoi"), require("d3-interpolate"), require("d3-collection"), require("d3-shape"), require("d3-path"), require("d3-polygon"), require("d3-quadtree"), require("d3-array"), require("d3-random"));

// ================================
// START YOUR APP HERE
// ================================
const svg = d3.select('svg'),
    height = window.innerHeight,
    width = window.innerWidth

const config = {
    numberOfSites: 10000,
    landmass: .4
}

//function for generating skewed distribution
function randomNorm(skew) {
    var x = (Math.random() - Math.random() + 1) / 2;
    //the bigger skew the smaller average
    if (typeof skew === "number") {
        x = Math.pow(x, skew);
    }
    return x;
}

svg.attr('width', width).attr('height', height)

const sites = d3.range(config.numberOfSites).map(function(d) {
    return [Math.round(Math.random() * width), Math.round(Math.random() * height)]
})
let voronoi = d3.voronoi()
    .extent([
        [-1, -1],
        [width + 1, height + 1]
    ])(sites)

var voronoiPolygons = voronoi.polygons()
voronoiPolygons.forEach((polygon) => {
    polygon.neighbours = []
    polygon.height = 0
    polygon.landLockedness = null
})

voronoi.edges.forEach((edge, i) => {

    if (!edge.left || !edge.right) {
        return;
    }

    let leftPolygon = voronoiPolygons[edge.left.index],
        rightPolygon = voronoiPolygons[edge.right.index]

    leftPolygon.neighbours.push(rightPolygon)
    rightPolygon.neighbours.push(leftPolygon)
})

function createLand() {
    let polygon = voronoiPolygons[Math.floor(Math.random() * voronoiPolygons.length)],
        sitesToColor = Math.floor(config.numberOfSites * config.landmass),
        shorePolygons = []

    //function for sorting polygons from most landlocked to least landlocked
    function sortShorePolygons() {
        shorePolygons.sort((a, b) => {
            return b.landLockedness - a.landLockedness
        })
    }

    function checkLandLockedness(polygon) {
        let neighbourWaterProvinces = 0,
            landLockedness = 0

        polygon.neighbours.forEach((neighbour) => {
            if (neighbour.height <= 0) {
                neighbourWaterProvinces++
            }
        })

        polygon.landLockedness = 1 - (neighbourWaterProvinces / polygon.neighbours.length)
        console.log(landLockedness)
        return landLockedness
    }

    function checkIfPolygonIsShore(polygon) {
        if (polygon.height <= 0) {
            polygon.landLockedness = null
            return false
        }

        let isShore = false,
            landLockedness = checkLandLockedness(polygon)

        isShore = (landLockedness < 1)

        if (isShore && shorePolygons.indexOf(polygon) === -1) {
            console.log('adding shore ', landLockedness)
            shorePolygons.push(polygon)
            sortShorePolygons()
        } else if (!isShore && shorePolygons.indexOf(polygon) > -1) {
            console.log('removing shore ', landLockedness)
            shorePolygons.splice(shorePolygons.indexOf(polygon), 1)
        }

        return isShore
    }

    //function searching for the best candidate to be a next land polygon
    function getNextPolygon(oldPolygon) {
        let nextPolygon,
            nextPolygonSource
        let waterPolygons = oldPolygon.neighbours.filter((neighbour) => {
            return neighbour.height <= 0
        })

        if (!shorePolygons.length || Math.random() > 1 - (3 / (config.landmass * config.numberOfSites))) {
            //sometimes we want to start a new continent
            waterPolygons = voronoiPolygons.filter((polygon) => {
                return polygon.height <= 0
            })
        } else if (!waterPolygons.length || (oldPolygon.landLockedness > .6 && Math.random() > .4)) {
            nextPolygonSource = shorePolygons[Math.floor(randomNorm(3) * shorePolygons.length)]
            waterPolygons = nextPolygonSource.neighbours.filter((neighbour) => {
                return neighbour.height <= 0
            })
        }
        nextPolygon = waterPolygons[Math.floor(randomNorm(1) * waterPolygons.length)]

        return nextPolygon
    }

    function setLand(polygon) {
        polygon.height = 1
        checkIfPolygonIsShore(polygon)
        polygon.neighbours.forEach((neighbour) => {
            checkIfPolygonIsShore(neighbour)
        })
    }
    setLand(polygon)

    while (sitesToColor > 0) {
        sitesToColor--
        polygon = getNextPolygon(polygon)
        setLand(polygon)
    }
    console.log(shorePolygons)

}

function drawPolygons() {
    let polygon = svg.append("g")
        .attr("class", "polygons")
        .selectAll("path")
        .data(voronoiPolygons)
        .enter().append("path")
        .attr("d", function(d) {
            return d ? "M" + d.join("L") + "Z" : null;
        })
        .attr('fill', function(d, i) {
            if (!d) {
                return
            }
            let color = d3.interpolate("rgb(174, 236, 255)", "rgb(141, 230, 153)")(d.height)
            return color
        })
}

(function init() {
    createLand()
    drawPolygons()

})()