class Sync::Cursor
  include Comparable

  class Invalid < StandardError; end

  attr_reader :time, :id, :issued_at

  def initialize(time:, id:, issued_at: Time.current)
    @time = time.utc
    @id = id
    @issued_at = issued_at.utc
  end

  def self.decode(token)
    return if token.blank?

    payload = JSON.parse(Base64.urlsafe_decode64(token))
    new(
      time: from_microseconds(payload.fetch('t')),
      id: Integer(payload.fetch('i')),
      issued_at: from_microseconds(payload.fetch('a'))
    )
  rescue ArgumentError, KeyError, TypeError, NoMethodError, JSON::ParserError
    raise Invalid
  end

  def self.for_record(record) = new(time: record.updated_at, id: record.id)

  def self.from_microseconds(value) = Time.zone.at(Rational(Integer(value), 1_000_000))

  def self.to_microseconds(time) = (time.to_r * 1_000_000).to_i

  private_class_method :from_microseconds

  def encode
    payload = { t: microseconds, i: id, a: self.class.to_microseconds(issued_at) }
    Base64.urlsafe_encode64(payload.to_json, padding: false)
  end

  def <=>(other) = [microseconds, id] <=> [other.microseconds, other.id]

  def microseconds = self.class.to_microseconds(time)

  def expired? = issued_at < Sync::TOMBSTONE_RETENTION.ago
end
