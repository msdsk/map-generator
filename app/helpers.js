//function for generating skewed distribution
function randomNorm(skew) {
    var x = (Math.random() - Math.random() + 1) / 2;
    //the bigger skew the smaller average
    if (typeof skew === "number") {
        x = Math.pow(x, skew);
    }
    return x;
}

export default {
    randomNorm: randomNorm
}
