/**
 * Application entry point
 */

// Load application styles
import 'styles/index.scss';
const d3 = Object.assign({}, require("d3-selection"), require("d3-voronoi"), require("d3-interpolate"), require("d3-collection"), require("d3-shape"), require("d3-path"), require("d3-polygon"), require("d3-quadtree"), require("d3-array"), require("d3-random"));
import landmass from 'landmass'
import mountains from 'mountains'
import climate from 'climate'

// ================================
// START YOUR APP HERE
// ================================
const svg = d3.select('svg'),
    height = window.innerHeight,
    width = window.innerWidth

const config = {
    numberOfSites: 10000,
    landmass: (() => {
        return Math.random() * .4 + .3
    })(),
    mountainPasses: (() => {
        return Math.floor(Math.random() * 3 + 3)
    })()
}

let landData = {
    shorePolygons: []
}

config.numberOfSitesSquareRoot = Math.floor(Math.pow(config.numberOfSites, .5))

let voronoi, voronoiPolygons

svg.attr('width', width).attr('height', height)

function prepareVoronoi() {

    let sites = d3.range(config.numberOfSites).map(function(d) {
        return [Math.round(Math.random() * width), Math.round(Math.random() * height)]
    })

    function distance(a, b) {
        return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
    }

    voronoi = d3.voronoi()
        .extent([
            [-1, -1],
            [width + 1, height + 1]
        ])

    function relaxSites() {
        //getting more uniform points distribution
        let polygons = voronoi(sites).polygons(),
            centroids = polygons.map(d3.polygonCentroid)

        sites.forEach((site, a) => {
            if (centroids[a]) {
                site[0] = centroids[a][0]
                site[1] = centroids[a][1]
            }
        })
    }
    for (let i = 0; i < 1; i++) {
        relaxSites()
    }

    voronoi = voronoi(sites)

    voronoiPolygons = voronoi.polygons()
    voronoiPolygons.forEach((polygon) => {
        polygon.neighbours = []
        polygon.height = 0
        polygon.landLockedness = 0
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
}

function determineColour(d) {
    if (!d) {
        return
    }
    let colour, lightness

    if (d.height <= 0) {
        lightness = d3.interpolate(15, 0)(d.height / -20)
    } else if (d.height === 1) {
        lightness = 35
    } else {
        lightness = d3.interpolate(30, 100)(d.height / 50)
    }
    colour = `hsl(0, 0%, ${lightness}%)`
    return colour
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
        .style('fill', determineColour)
        .attr('data-landlockeness', (d) => {
            if (!d) {
                return
            }
            return d.landLockedness
        })
        .attr('data-height', (d) => {
            if (!d) {
                return
            }
            return d.height
        })
        .style('stroke', determineColour)
}

function drawClimate() {

}

(function init() {
    prepareVoronoi()
    landData = landmass.init(voronoiPolygons, config, landData)
    landData = mountains.init(voronoiPolygons, config, landData)
    drawPolygons()
    climate.init(voronoiPolygons, config, landData)
})()