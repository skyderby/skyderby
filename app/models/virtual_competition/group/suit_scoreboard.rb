class VirtualCompetition::Group
  class SuitScoreboard < Scoreboard
    PER_PAGE = 10

    attr_reader :suit

    def initialize(group, suit:, **)
      @suit = suit
      super(group, **)
    end

    def per_page = PER_PAGE

    def category = populated_categories.first

    def available? = category.present?
  end
end
