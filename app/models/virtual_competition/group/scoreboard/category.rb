class VirtualCompetition::Group::Scoreboard
  class Category
    attr_reader :scoreboard, :suit_kind, :competitions, :standings, :page

    delegate :group, :show_rank_changes?, :columns_count, :per_page, to: :scoreboard

    def initialize(scoreboard, suit_kind, competitions, standings, page: 1)
      @scoreboard = scoreboard
      @suit_kind = suit_kind
      @competitions = competitions
      @standings = standings
      @page = page
    end

    def name = I18n.t("virtual_competitions.suit_kinds.#{suit_kind}")

    def to_param = suit_kind

    def competition(discipline) = competitions[discipline]

    def rows = @rows ||= standings.rows.first(page * per_page)

    def rows_on_page = standings.rows.slice((page - 1) * per_page, per_page) || []

    def more? = standings.rows.size > rows.size

    def next_page = page + 1

    def podium? = standings.rows.size >= 3
  end
end
