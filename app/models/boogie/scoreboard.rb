class Boogie::Scoreboard
  attr_reader :event, :until_round, :number_of_results_for_total

  def initialize(event, until_round: nil)
    @event = event
    @number_of_results_for_total = event.number_of_results_for_total
    @until_round = until_round
  end

  def rounds = event.rounds.order(:number)

  def completed_rounds
    @completed_rounds ||=
      if until_round
        rounds.where(number: ..until_round)
      else
        rounds
      end
  end

  def categories
    @categories ||=
      event
      .categories
      .includes(competitors: [:event, { profile: :country, suit: :manufacturer }])
      .ordered
      .index_with { |category| category_standings(category) }
  end

  def category_standings(category)
    category_competitors = category.competitors
    category_results = results.select { |result| category_competitors.include? result.competitor }
    previous_standings = Standings.new(
      category_competitors, completed_rounds[0...-1], category_results, number_of_results_for_total
    )

    Standings.new(
      category_competitors, completed_rounds, category_results, number_of_results_for_total, previous_standings
    )
  end

  def results
    @results ||= event.results.includes(:round, :competitor)
  end
end
