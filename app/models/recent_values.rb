class RecentValues
  attr_reader :values

  def initialize(cookies)
    @cookies = cookies
    @values = YAML::load(cookies[:recent_values] || '') || {}
  end

  def add(key, val)
    @values[key] = val
    dump
  end

  def delete(key)
    @values.delete(key)
  end

  def [](key)
    values[key]
  end

  private

  def dump
    @cookies[:recent_values] = {value: YAML::dump(values), expires: 1.year.from_now}
  end
end
