class TrackOrder
  attr_reader :attribute, :direction

  ALLOWED_FIELDS = %w[ID RECORDED_AT SPEED DISTANCE TIME].freeze
  ALLOWED_DIRECTIONS = %w[ASC DESC].freeze

  ORDERS = {
    DEFAULT: ->(rel, att, dir) { rel.order(order_clause(att, dir)) },
    SPEED: ->(rel, _, dir) { rel.left_outer_joins(:speed).order(order_clause('track_results.result', dir)) },
    DISTANCE: ->(rel, _, dir) { rel.left_outer_joins(:distance).order(order_clause('track_results.result', dir)) },
    TIME: ->(rel, _, dir) { rel.left_outer_joins(:time).order(order_clause('track_results.result', dir)) }
  }.with_indifferent_access.freeze

  ATTR_INDEX = 0
  DIRECTION_INDEX = 1

  DEFAULT_ATTR = 'ID'.freeze
  DEFAULT_DIRECTION = 'DESC'.freeze

  DEFAULT_ORDER = "#{DEFAULT_ATTR} #{DEFAULT_DIRECTION}".freeze

  def initialize(param_string)
    order_params = (param_string || '').split ' '
    @attribute = (order_params[ATTR_INDEX] || DEFAULT_ATTR).upcase
    @direction = (order_params[DIRECTION_INDEX] || DEFAULT_DIRECTION).upcase
  end

  def apply(relation)
    return relation.order(default_order) unless order_valid

    instance_exec(relation, attribute, direction, &(ORDERS[attribute] || ORDERS[:DEFAULT]))
  end

  private

  def order_valid
    ALLOWED_FIELDS.include?(attribute.to_s.upcase) &&
      ALLOWED_DIRECTIONS.include?(direction.to_s.upcase)
  end

  def default_order
    order_clause DEFAULT_ATTR, DEFAULT_DIRECTION
  end

  def order_clause(attr, dir)
    "#{attr} #{dir} NULLS LAST"
  end
end
