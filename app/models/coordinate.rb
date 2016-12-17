class Coordinate
  attr_reader :latitude, :longitude

  def initialize(latitude: , longitude:)
    @latitude = latitude
    @longitude = longitude
  end

  def [](key)
    public_send key
  end
end
