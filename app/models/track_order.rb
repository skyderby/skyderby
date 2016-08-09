class TrackOrder
  attr_reader :attribute, :direction

  ALLOWED_FIELDS = %w(ID RECORDED_AT SPEED_RESULT DISTANCE_RESULT TIME_RESULT)
  ALLOWED_DIRECTIONS = %w(ASC DESC)

  ATTR_INDEX = 0
  DIRECTION_INDEX = 1

  DEFAULT_ATTR = 'ID'
  DEFAULT_DIRECTION = 'DESC'

  DEFAULT_ORDER = "#{DEFAULT_ATTR} #{DEFAULT_DIRECTION}"

  def initialize(param_string)
    order_params = (param_string || '').split ' '
    @attribute = order_params[ATTR_INDEX] || DEFAULT_ATTR
    @direction = order_params[DIRECTION_INDEX] || DEFAULT_DIRECTION
  end

  def apply(relation)
    return relation.order(default_order) unless order_valid
    relation.order(current_order)
  end

  private

  def order_valid
    ALLOWED_FIELDS.include?(attribute.to_s.upcase) && 
      ALLOWED_DIRECTIONS.include?(direction.to_s.upcase)
  end

  def current_order
    order_clause attribute, direction
  end

  def default_order
    order_clause DEFAULT_ATTR, DEFAULT_DIRECTION
  end

  def order_clause(attr, dir)
    "#{attr} #{dir}"
  end
end
