Skyderby.helpers.trackDirection = function(start_point, end_point) {
    var radians = function(n) {
        return n * (Math.PI / 180);
    };

    var degrees = function(n) {
        return n * (180 / Math.PI);
    };

    var getBearing = function(startLat,startLong,endLat,endLong){
        startLat = radians(startLat);
        startLong = radians(startLong);
        endLat = radians(endLat);
        endLong = radians(endLong);

        var dLong = endLong - startLong;

        var dPhi = Math.log(Math.tan(endLat/2.0+Math.PI/4.0)/Math.tan(startLat/2.0+Math.PI/4.0));
        if (Math.abs(dLong) > Math.PI){
            if (dLong > 0.0)
                dLong = -(2.0 * Math.PI - dLong);
            else
                dLong = (2.0 * Math.PI + dLong);
        }

        return (degrees(Math.atan2(dLong, dPhi)) + 360.0) % 360.0;
    };

    return getBearing(
        start_point.latitude, 
        start_point.longitude, 
        end_point.latitude, 
        end_point.longitude
    );
};
