class Tournament::Qualification::CompetitorsCollection
  include Enumerable

  delegate :each, to: :competitors

  def initialize(tournament_competitors, scoreboard)
    @tournament_competitors = tournament_competitors
    @scoreboard = scoreboard
  end

  private

  attr_reader :tournament_competitors, :scoreboard

  def competitors
    @competitors =
      tournament_competitors
      .then { |collection| map_competitors(collection) }
      .then { |collection| sort_competitors(collection) }
      .then { |collection| assign_ranks(collection) }
  end

  def assign_ranks(collection)
    previous_key = nil
    previous_rank = 0
    position = 0

    collection.each do |competitor|
      next if competitor.is_disqualified

      position += 1
      key = competitor.ranking_key

      if key == previous_key && competitor.scored?
        competitor.rank = previous_rank
      else
        competitor.rank = position
        previous_rank = position
        previous_key = key
      end
    end

    collection
  end

  def map_competitors(collection)
    collection.map do |competitor|
      Tournament::Qualification::Competitor.new(competitor, scoreboard)
    end
  end

  def sort_competitors(collection)
    collection.sort_by do |competitor|
      [
        competitor.is_disqualified ? 1 : 0,
        competitor.ranking_key,
        competitor.name.to_s
      ]
    end
  end
end
