class TrackOrder
  attr_reader :attribute, :direction

  ALLOWED_FIELDS = %w[ID RECORDED_AT SPEED DISTANCE TIME].freeze
  ALLOWED_DIRECTIONS = %w[ASC DESC].freeze

  ORDERS = {
    DEFAULT: ->(rel, att, dir) { rel.order(order_clause(att, dir)) },
    SPEED: ->(rel, _, dir) { rel.left_joins(:speed).order(order_clause('track_results.result', dir)) },
    DISTANCE: ->(rel, _, dir) { rel.left_joins(:distance).order(order_clause('track_results.result', dir)) },
    TIME: ->(rel, _, dir) { rel.left_joins(:time).order(order_clause('track_results.result', dir)) }
  }.with_indifferent_access.freeze

  def initialize(param_string)
    attribute, direction = (param_string || '').split
    @attribute = attribute&.upcase || 'id'
    @direction = direction&.upcase || 'desc'
  end

  def apply(relation)
    return relation.all unless order_valid

    instance_exec(relation, attribute, direction, &(ORDERS[attribute] || ORDERS[:DEFAULT])) # rubocop:disable Style/RedundantParentheses
  end

  private

  def order_valid
    ALLOWED_FIELDS.include?(attribute) && ALLOWED_DIRECTIONS.include?(direction)
  end

  def order_clause(attr, dir)
    "#{attr} #{dir} NULLS LAST"
  end
end
