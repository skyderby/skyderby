class TrackResultData < Struct.new(
  :range_from,
  :range_to,
  :time,
  :distance,
  :speed
) 
 
  def initialize(arguments)
    members.each { |m| self[m] = arguments[m] if arguments[m] }
  end
end
