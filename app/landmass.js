import helpers from 'helpers'

function createLand(voronoiPolygons, config, landData) {
    let polygon = voronoiPolygons[Math.floor(Math.random() * voronoiPolygons.length)],
        sitesToColor = Math.floor(config.numberOfSites * config.landmass),
        shorePolygons = landData.shorePolygons

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
        } else if (!waterPolygons.length || (oldPolygon.landLockedness > .6 && Math.random() > .8)) {
            nextPolygonSource = shorePolygons[Math.floor(helpers.randomNorm(3) * shorePolygons.length)]
            waterPolygons = nextPolygonSource.neighbours.filter((neighbour) => {
                return neighbour.height <= 0
            })
        }
        waterPolygons.forEach((waterPolygon) => {
            helpers.checkLandLockedness(waterPolygon)
        })
        waterPolygons.sort((a, b) => {
            return b.landLockedness - a.landLockedness
        })
        nextPolygon = waterPolygons[Math.floor(helpers.randomNorm(3) * waterPolygons.length)]

        return nextPolygon
    }

    function setLand(polygon) {
        polygon.height = 1
        helpers.checkIfPolygonIsShore(polygon, landData.shorePolygons)
        polygon.neighbours.forEach((neighbour) => {
            helpers.checkIfPolygonIsShore(neighbour, landData.shorePolygons)
        })
    }
    setLand(polygon)

    while (sitesToColor > 0) {
        sitesToColor--
        polygon = getNextPolygon(polygon)
        setLand(polygon)
    }

    //removing stray lakes and genral land smoothing
    let toCleanUp = Math.floor(config.numberOfSites * config.landmass / 30)
    let prevShorePoly = shorePolygons[0]
    for (let i = 0; i < toCleanUp; i++) {
        if (!shorePolygons.length) {
            break;
        }
        let waterPolygons = shorePolygons[0].neighbours.filter((neighbour) => {
            return neighbour.height <= 0
        })
        setLand(waterPolygons[0])
    }

    function setWaterDepth() {
        let currentDepth = -1,
            maxDepth = -20,
            lastPassChecked = shorePolygons.slice(),
            newPassChecked,
            waterPolygonsToCheck = voronoiPolygons.filter((polygon) => {
                return polygon.height <= 0
            })

        for (currentDepth; currentDepth > maxDepth; currentDepth--) {
            newPassChecked = []
            lastPassChecked.forEach((polygon) => {
                polygon.neighbours.forEach((neighbour) => {
                    if (waterPolygonsToCheck.indexOf(neighbour) === -1) {
                        return
                    }
                    neighbour.height = currentDepth
                    waterPolygonsToCheck.splice(waterPolygonsToCheck.indexOf(neighbour), 1)
                    newPassChecked.push(neighbour)
                })
            })
            lastPassChecked = newPassChecked
        }
        waterPolygonsToCheck.forEach((polygon) => {
            polygon.height = maxDepth
        })
    }
    setWaterDepth()

    function setBasicLandShape() {
        let currentHeight = 1,
            maxHeight = 3,
            lastPassChecked = shorePolygons.slice(),
            newPassChecked,
            landPolygonsToCheck = voronoiPolygons.filter((polygon) => {
                return polygon.height > 0
            })

        for (currentHeight; currentHeight < maxHeight; currentHeight = currentHeight + .1) {
            newPassChecked = []
            lastPassChecked.forEach((polygon) => {
                polygon.neighbours.forEach((neighbour) => {
                    if (landPolygonsToCheck.indexOf(neighbour) === -1) {
                        return
                    }
                    neighbour.height = currentHeight
                    landPolygonsToCheck.splice(landPolygonsToCheck.indexOf(neighbour), 1)
                    newPassChecked.push(neighbour)
                })
            })
            lastPassChecked = newPassChecked
        }
        landPolygonsToCheck.forEach((polygon) => {
            polygon.height = maxHeight
        })
    }
    setBasicLandShape()

    return {
        shorePolygons: shorePolygons
    }
}

export default {
    init: createLand
}