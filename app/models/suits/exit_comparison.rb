module Suits
  class ExitComparison
    LIMIT = 4

    def initialize(suit, compare_ids)
      @suit = suit
      @requested_ids = Array(compare_ids).map(&:to_i).uniq.excluding(suit.id).first(LIMIT)
    end

    def primary = @primary ||= suit.exit_performance

    def compared
      @compared ||= @requested_ids.filter_map { |id| compared_by_suit_id[id] }
    end

    def performances = @performances ||= [primary, *compared]

    def compared_ids = compared.map(&:suit_id)

    def available? = primary.present?

    def full? = compared.size >= LIMIT

    def ids_without(suit_id) = compared_ids.excluding(suit_id)

    def ids_with(suit_id) = compared_ids.including(suit_id)

    private

    attr_reader :suit

    def compared_by_suit_id
      @compared_by_suit_id ||=
        Suit::ExitPerformance.includes(:suit).where(suit_id: @requested_ids).index_by(&:suit_id)
    end
  end
end
