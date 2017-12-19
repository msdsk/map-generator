//function for generating skewed distribution
function randomNorm(skew) {
    var x = (Math.random() - Math.random() + 1) / 2;
    //the bigger skew the smaller average
    if (typeof skew === "number") {
        x = Math.pow(x, skew);
    }
    return x;
}



//function for sorting polygons from most landlocked to least landlocked
function sortShorePolygons(shorePolygons) {
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

    landLockedness = polygon.landLockedness = 1 - (neighbourWaterProvinces / polygon.neighbours.length)
    return landLockedness
}


function checkIfPolygonIsShore(polygon, shorePolygons) {
    if (polygon.height <= 0) {
        polygon.landLockedness = null
        return false
    }

    let isShore = false,
        landLockedness = checkLandLockedness(polygon)

    isShore = (landLockedness < 1)

    if (isShore && shorePolygons && shorePolygons.indexOf(polygon) === -1) {
        shorePolygons.push(polygon)
        sortShorePolygons(shorePolygons)
    } else if (shorePolygons && !isShore && shorePolygons.indexOf(polygon) > -1) {
        shorePolygons.splice(shorePolygons.indexOf(polygon), 1)
    }

    return isShore
}

export default {
    randomNorm: randomNorm,
    checkLandLockedness: checkLandLockedness,
    checkIfPolygonIsShore: checkIfPolygonIsShore
}