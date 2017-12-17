/**
 * Application entry point
 */

// Load application styles
import 'styles/index.scss';
const d3 = Object.assign({}, require("d3-selection"), require("d3-voronoi"), require("d3-interpolate"), require("d3-collection"), require("d3-shape"), require("d3-path"), require("d3-polygon"), require("d3-quadtree"), require("d3-array"), require("d3-random"));
import landmass from 'landmass'
import mountains from 'mountains'

// ================================
// START YOUR APP HERE
// ================================
const svg = d3.select('svg'),
    height = window.innerHeight,
    width = window.innerWidth

const config = {
    numberOfSites: 10000,
    landmass: .6,
    mountainPasses: (() => {
        return Math.floor(Math.random() * 3 + 5)
    })()
}

config.numberOfSitesSquareRoot = Math.floor(Math.pow(config.numberOfSites, .5))

let voronoi, voronoiPolygons

svg.attr('width', width).attr('height', height)

function prepareVoronoi() {

    const sites = d3.range(config.numberOfSites).map(function (d) {
        return [Math.round(Math.random() * width), Math.round(Math.random() * height)]
    })
    voronoi = d3.voronoi()
        .extent([
            [-1, -1],
            [width + 1, height + 1]
        ])(sites)

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
    let color

    if (d.height <= 0) {
        color = d3.interpolate('#333', "#000")(d.height / -20)
    } else {
        color = d3.interpolate('#666', '#fff')(d.height / 30)
    }
    return color
}

function drawPolygons() {
    let polygon = svg.append("g")
        .attr("class", "polygons")
        .selectAll("path")
        .data(voronoiPolygons)
        .enter().append("path")
        .attr("d", function (d) {
            return d ? "M" + d.join("L") + "Z" : null;
        })
        .attr('fill', determineColour)
        .attr('data-landlockeness', (d) => {
            if (!d) {
                return
            }
            return d.landLockedness
        }).style('stroke', determineColour)
}

(function init() {
    prepareVoronoi()
    landmass.init(voronoiPolygons, config)
    mountains.init(voronoiPolygons, config)
    drawPolygons()
})()
