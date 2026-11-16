module ArrayColumn
  class Base < ActiveModel::Type::Value
    def deserialize(value)
      value.is_a?(String) ? decoder.decode(value) : value
    end

    def cast(value)
      return if value.nil?

      values = value.is_a?(String) ? deserialize(value) : Array.wrap(value)
      values.map { |element| element.nil? ? nil : cast_element(element) }
    end

    def serialize(value)
      value.nil? ? nil : encoder.encode(cast(value))
    end

    def changed_in_place?(raw_old_value, new_value)
      deserialize(raw_old_value) != new_value
    end

    private

    def decoder
      @decoder ||= PG::TextDecoder::Array.new(elements_type: self.class::ELEMENT_DECODER.new)
    end

    def encoder
      @encoder ||= PG::TextEncoder::Array.new(elements_type: self.class::ELEMENT_ENCODER.new)
    end
  end

  class Float < Base
    ELEMENT_DECODER = PG::TextDecoder::Float
    ELEMENT_ENCODER = PG::TextEncoder::String

    def type = :float_array

    def serialize(value)
      value.nil? ? nil : encoder.encode(cast(value).map { |element| element&.to_s })
    end

    private

    def cast_element(element) = element.is_a?(::Float) ? element : Float(element.to_s)
  end

  class Decimal < Base
    ELEMENT_DECODER = PG::TextDecoder::Numeric
    ELEMENT_ENCODER = PG::TextEncoder::Numeric

    def type = :decimal_array

    private

    def cast_element(element) = BigDecimal(element.to_s)
  end

  class Time < Base
    ELEMENT_DECODER = PG::TextDecoder::TimestampWithTimeZone
    ELEMENT_ENCODER = PG::TextEncoder::TimestampWithTimeZone

    def type = :time_array

    private

    def cast_element(element) = element.is_a?(::Time) ? element : ::Time.zone.at(element)
  end
end
