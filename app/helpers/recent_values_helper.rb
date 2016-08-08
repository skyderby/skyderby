module RecentValuesHelper
  def recent_value(key)
    RecentValues.new(cookies)[key]
  end
end
