
# Columns:
# INDEX
# TAG
# DATE
# TIME
# LATITUDE N/S
# LONGITUDE E/W
# HEIGHT
# SPEED
# HEADING
# VOX

class ColumbusParser < CSVParser

  protected

  def parse_row(row)
    return nil if row[6].to_f == 0.0

    { :latitude => parse_latitude(row),
     :longitude => parse_longitude(row),
     :elevation => row[6].to_f,
     :abs_altitude => row[6].to_f,
     :point_created_at => parse_datetime(row) }
  end

  private

  def parse_latitude(row)
    (row[4][0..(row[4].length-2)] * (row[4][row[4].length-1] == 'N' ? 1 : -1)).to_f
  end

  def parse_longitude(row)
    (row[5][0..(row[5].length-2)] * (row[5][row[5].length-1] == 'E' ? 1 : 1)).to_f
  end

  def parse_datetime(row)
    Time.strptime('20' + row[2].to_s + 'T' + row[3].to_s, '%Y%m%dT%H%M%S')
  end

end
