Skyderby.helpers.pointInterpolation = function(start_point, end_point, k) {
    if (k === 0) return start_point;
    if (k === 1) return end_point;

    return {
        altitude: Number(start_point.altitude) + (Number(end_point.altitude) - Number(start_point.altitude)) * k,
        latitude: Number(start_point.latitude) + (Number(end_point.latitude) - Number(start_point.latitude)) * k,
        longitude: Number(start_point.longitude) + (Number(end_point.longitude) - Number(start_point.longitude)) * k
    };
};
