class FlySightParser < CSVParser

  protected

  # Columns:
  # FlySight old firmware:
  # time
  # lat
  # lon
  # hMSL
  # velN
  # velE
  # velD
  # hAcc
  # vAcc
  # sAcc
  # gpsFix
  # numSV
  #
  # FlySight newest firmware
  # time
  # lat
  # lon
  # hMSL
  # velN
  # velE
  # velD
  # hAcc
  # vAcc
  # sAcc
  # heading
  # cAcc
  # gpsFix
  # numSV

  def parse_row(row)

    return nil if (row[1].to_i == 0 || row[8].to_i > 70)

    {:latitude => row[1].to_f,
     :longitude => row[2].to_f,
     :elevation => row[3].to_f,
     :abs_altitude => row[3].to_f,
     :point_created_at => row[0].to_s}

  end

end