export default class {
  constructor(data) {
    this.video_offset = Number(data.video_offset)
    this.track_offset = Number(data.track_offset)
    this.points = data.points
  }

  point_in_time(time) {
    let relative_time = time - this.video_offset

    if (relative_time < 0) return new NullPoint

    let track_time = relative_time + this.track_offset

    return this.interpolated_point_for_time(track_time)
  }

  interpolated_point_for_time(time) {
    let [predecessor, successor] = this.points_around_time(time)

    if (!predecessor && !successor) return new NullPoint

    return new InterpolatedPoint(predecessor, successor, time, this.start_alitude)
  }

  points_around_time(time) {
    for (let index = 0; index <= this.points.length; index ++) {
      if (index === 0) continue

      let predecessor = this.points[index - 1]
      let successor = this.points[index]

      if (predecessor.fl_time <= time && time <= successor.fl_time) return [predecessor, successor]
    }

    return []
  }

  get start_alitude() {
    if (this._start_altitude === undefined) {
      if (this.points.length > 0) {
        this._start_altitude = this.points[0].altitude
      } else {
        this._start_altitude = 0
      }
    }

    return this._start_altitude
  }
}

class InterpolatedPoint {
  constructor(predecessor, successor, time, start_altitude) {
    this.predecessor = predecessor
    this.successor = successor
    this.time = time
    this.start_altitude = start_altitude
  }

  interpolate(pred_value, succ_value) {
    return pred_value + (succ_value - pred_value) * this.interpolation_factor
  }

  get altitude() {
    return Math.round(this.interpolate(this.predecessor.altitude, this.successor.altitude))
  }

  get altitude_spent() {
    return Math.round(this.start_altitude - this.altitude)
  }

  get h_speed() {
    return Math.round(this.interpolate(this.predecessor.h_speed, this.successor.h_speed))
  }

  get v_speed() {
    return Math.round(this.interpolate(this.predecessor.v_speed, this.successor.v_speed))
  }

  get glide_ratio() {
    return this.interpolate(this.predecessor.glide_ratio, this.successor.glide_ratio).toFixed(2)
  }

  get interpolation_factor() {
    if (!this._interpolation_factor) {
      this._interpolation_factor =
        (this.time - this.predecessor.fl_time) / (this.successor.fl_time - this.predecessor.fl_time)
    }

    return this._interpolation_factor
  }
}

class NullPoint {
  get altitude() {
    return '---'
  }

  get altitude_spent() {
    return '---'
  }

  get h_speed() {
    return '---'
  }

  get v_speed() {
    return '---'
  }

  get glide_ratio() {
    return '-.--'
  }
}
