class RecentValues
  attr_reader :values
  delegate :[], to: :values

  def initialize(cookies)
    @cookies = cookies
    @values = YAML.safe_load(
      cookies[:recent_values] || '',
      permitted_classes: [Symbol]
    ) || {}
  end

  def add(key, val)
    @values[key] = val
    dump
  end

  def delete(key)
    @values.delete(key)
  end

  private

  def dump
    @cookies[:recent_values] = { value: YAML.dump(values), expires: 1.year.from_now }
  end
end
