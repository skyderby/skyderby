class Track::Points
  Point = Data.define(*COLUMNS) do
    def [](attribute) = public_send(attribute)
  end
end
