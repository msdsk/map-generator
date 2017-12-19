import helpers from 'helpers'

function createMountains(voronoiPolygons, config, landData) {
    let mountainConfig = {
        rangeLength: [config.numberOfSitesSquareRoot * 3, config.numberOfSitesSquareRoot * 10],
        minHeightToBeCalledAMountain: 10,
        tooDeepToMakeMountains: 0
    }
    let flatAreas = voronoiPolygons.filter((polygon) => {
        return (polygon.height < mountainConfig.minHeightToBeCalledAMountain && polygon.height > mountainConfig.tooDeepToMakeMountains)
    })

    function checkNeighboursHeight(polygon) {
        let neighboursHeight = 0
        polygon.neighbours.forEach((neighbour) => {
            neighboursHeight += neighbour.height
        })
        return polygon.neighboursHeight = neighboursHeight
    }

    function createRange() {
        let peaks = []

        function createPeaks() {
            let lengthMin = mountainConfig.rangeLength[0],
                lengthMax = mountainConfig.rangeLength[1],
                length = Math.floor(Math.random() * (lengthMax - lengthMin) + lengthMin),
                polygon = flatAreas[Math.floor(Math.random() * flatAreas.length)],
                currentHeight = (() => {
                    return Math.floor(Math.random() * 15 + 15)
                })()

            function createPeak(polygon) {
                currentHeight = currentHeight + (Math.random() - .5) * 10
                currentHeight = currentHeight < 10 ? 10 : currentHeight
                currentHeight = currentHeight > 35 ? 35 : currentHeight
                polygon.height = polygon.height + currentHeight
                peaks.push(polygon)
            }
            createPeak(polygon)

            //looking for the best neighbour polygon to be the next in range
            for (let i = 0; i < length; i++) {
                let suitablePolygons = polygon.neighbours.filter((neighbour) => {
                    return (neighbour.height < mountainConfig.minHeightToBeCalledAMountain && neighbour.height > mountainConfig.tooDeepToMakeMountains)
                })
                suitablePolygons.forEach(checkNeighboursHeight)
                suitablePolygons.sort((a, b) => {
                    return a.neighboursHeight - b.neighboursHeight
                })
                polygon = suitablePolygons[Math.floor(helpers.randomNorm(3) * suitablePolygons.length)]
                if (!polygon) {
                    break;
                }
                createPeak(polygon)
            }
        }

        function easeOffPeaks() {
            let toCheck = voronoiPolygons.filter(polygon => {
                    return (peaks.indexOf(polygon) === -1)
                }),
                lastPassChecked = peaks.slice(),
                newPassChecked

            function determineHeight(polygon, sourcePolygon) {
                let heights = 0
                // polygon.neighbours.forEach(neighbour => {
                //     heights += neighbour.height
                //     // if (neighbour.height < lowestHeight) {
                //     //     lowestHeight = neighbour.height
                //     // }
                // })
                let height = sourcePolygon.height - Math.random() * 1.5 - 3.5
                return height > polygon.height ? height : polygon.height
            }

            for (let i = 0; i < 12; i++) {
                newPassChecked = []
                lastPassChecked.forEach(polygon => {
                    polygon.neighbours.forEach(neighbour => {
                        if (toCheck.indexOf(neighbour) === -1) {
                            return
                        }
                        let height = determineHeight(neighbour, polygon)
                        neighbour.height = height
                        toCheck.splice(toCheck.indexOf(neighbour), 1)
                        newPassChecked.push(neighbour)
                    })
                })
                lastPassChecked = newPassChecked
            }
        }
        createPeaks()
        easeOffPeaks()
    }
    for (let i = 0; i < config.mountainPasses; i++) {
        createRange()
    }

    function erodeLand() {
        let landPolygons = voronoiPolygons.filter(polygon => {
                return polygon.height > 1
            }),
            erosionStrength = .02
        landPolygons.sort((a, b) => {
            return b.height - a.height
        })

        function erodePolygon(polygon) {
            let nextPolygonHeight = polygon.height,
                nextPolygon = polygon
            polygon.neighbours.forEach(neighbour => {
                if (neighbour.height < nextPolygonHeight) {
                    nextPolygonHeight = neighbour.height
                    nextPolygon = neighbour
                }
            })

            if (nextPolygon !== polygon && polygon.height > 0) {
                polygon.height = polygon.height - Math.abs(polygon.height - nextPolygonHeight) * erosionStrength
                erodePolygon(nextPolygon)
            }
        }

        while (landPolygons.length) {
            let source = landPolygons.shift()
            erodePolygon(source)
        }
    }
    for (let i = 0; i < 5; i++) {
        erodeLand()
    }

    return landData

}

export default {
    init: createMountains
}