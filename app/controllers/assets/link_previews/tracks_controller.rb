class Assets::LinkPreviews::TracksController < ApplicationController
  def show
    track = Track.find(params[:id])

    map = MiniMagick::Image.open(get_map_url(track))
    map.contrast

    convert = MiniMagick::Tool::Convert.new
    convert.size '380x300'
    convert.xc 'black'
    convert.draw 'fill #ffffff roundRectangle 0,0 380,300 5,5'
    convert << 'app/assets/images/canvas.png'
    convert.call

    card = MiniMagick::Image.open('app/assets/images/canvas.png')

    logo = MiniMagick::Image.open('app/assets/images/logo260.png')
    logo.resize '24x24'

    result = card.composite(map) do |c|
      c.compose 'Over'    # OverCompositeOp
      c.geometry '+10+10' # copy second_image onto first_image from (20, 20)
    end

    result = result.composite(logo) do |c|
      c.compose 'Over'    # OverCompositeOp
      c.geometry '+334+216' # copy second_image onto first_image from (20, 20)
    end

    result.draw "text 10,270 'Скорость'"
    result.draw "text 10,285 '375 км/ч'"

    result.draw "text 80,270 'Расстояние'"
    result.draw "text 80,285 '5975м'"

    result.draw "text 170,270 'Время'"
    result.draw "text 170,285 '143 с'"

    send_file result.path, type: result.mime_type, disposition: 'inline'
  end

  private

  def get_map_url(track)
    endpoint = 'https://maps.googleapis.com/maps/api/staticmap'

    points = get_points(track)
    points.map do |point|
      point['color'] = color(point['h_speed'])
    end

    partitions = split_by_collor(points)
    paths = get_paths_from_partitions(partitions)

    start_marker = "size:tiny%7Ccolor:0x002288%7C#{points.first['latitude']},#{points.first['longitude']}"

    params = paths << %W[
      markers=#{start_marker}
      maptype=satellite
      size=180x120
      scale=2
      key=#{ENV['MAPS_API_KEY']}
    ]
    params = params.join('&')
    "#{endpoint}?#{params}"
  end

  def split_by_collor(points)
    partitions = [[]]
    last_color = points.first['color']

    points.each do |point|
      if point['color'] != last_color
        partitions.last << point
        last_color = point['color']
        partitions << []
      end
      partitions.last << point
    end

    partitions
  end

  def get_paths_from_partitions(partitions)
    paths = []

    partitions.each do |part|
      path_style = "color:#{part.first['color']}|weight:5|"
      path_points =
        part.map do |point|
          [point['latitude'], point['longitude']].join(',')
        end.join('|')
      paths << "path=#{path_style}#{path_points}"
    end

    paths
  end

  def get_points(track)
    PointsQuery.execute(track, freq_1hz: true, trimmed: true,
                               only: [:abs_altitude, :altitude, :latitude, :longitude, :h_speed, :v_speed])
  end

  def color_linear_scale(velocity)
    return '0x60000cff' if velocity > 250.0
    return '0xe7000cff' if velocity > 220.0
    return '0xe4670fff' if velocity > 190.0
    return '0xd9ce34ff' if velocity > 160.0
    return '0x42c043ff' if velocity > 130.0

    '0x2d7e2eff' # 0 - 112 - green
  end

  # F = C * A * (p * V^2)/2
  # F - is a drag force or rezistence force
  # where C is the drag coefficient, A is the area of the object
  # facing the fluid/air, and ρ is the density of the fluid.
  # The rezistence force of air drag is proportional to the velocity squared
  # Colors below shows how hard to reach this velocity
  #   0 - 112 - green         #2d7e2eff   |112  deltaF ~= 12500
  # 112 - 158 - light green   #42c043ff   |46   deltaF ~= 12500
  # 158 - 194 - yellow        #d9ce34ff   |36   deltaF ~= 12500
  # 194 - 224 - orange        #e4670fff   |30   deltaF ~= 12500
  # 224 - 250 - red           #e7000cff   |26   deltaF ~= 12500
  # 250 - inf - braun         #60000cff   |inf  deltaF ~= inf
  def color(velocity)
    return '0x60000cff' if velocity > 250.0
    return '0xe7000cff' if velocity > 223.606
    return '0xe4670fff' if velocity > 193.649
    return '0xd9ce34ff' if velocity > 158.113
    return '0x42c043ff' if velocity > 111.803

    '0x2d7e2eff' # 0 - 112 - green
  end

  def drag_force(velocity, altitude)
    c = 1
    a = 0.25
    c * a * (dencity(altitude) * velocity**2) / 2
  end

  def dencity(altitude)
    1.225 - altitude / 0.0001052333
  end

  # Thr worl online competition record is 379.7 км/ч
end
