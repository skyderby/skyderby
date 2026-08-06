module VirtualCompetitions
  class Index
    class Group < SimpleDelegator
      Category = Struct.new(:suit_kind, :cells) do
        def name = I18n.t("virtual_competitions.suit_kinds.#{suit_kind}")
      end

      Cell = Struct.new(:discipline, :competition, :athlete_count)

      attr_reader :section

      delegate :size, to: :@competitions
      delegate :athlete_count, to: :@index

      def initialize(group, competitions, section, index)
        super(group)
        @competitions = competitions
        @section = section
        @index = index
      end

      def cards = @cards ||= @competitions - combined_competitions

      def disciplines = VirtualCompetition::Group::Scoreboard::DISCIPLINES

      def combined_scoreboard? = combined_categories.any?

      def combined_competitions = combined_categories.values.flat_map(&:values)

      def combined_athlete_count = @index.combined_athlete_count(self)

      def combined_categories
        @combined_categories ||= VirtualCompetition::Group::Scoreboard.categorize(@competitions)
      end

      def categories
        @categories ||=
          combined_categories.map do |suit_kind, by_discipline|
            cells = by_discipline.map do |discipline, competition|
              Cell.new(discipline, competition, athlete_count(competition))
            end

            Category.new(suit_kind, cells)
          end
      end
    end
  end
end
