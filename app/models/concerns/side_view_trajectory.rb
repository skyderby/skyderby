module SideViewTrajectory
  def horizontal_step(from, to)
    return 0.0 unless coordinates?(from) && coordinates?(to)

    Skyderby::Geospatial.distance(
      [from[:latitude], from[:longitude]],
      [to[:latitude], to[:longitude]]
    )
  end

  def coordinates?(point) = point[:latitude] && point[:longitude]
end
