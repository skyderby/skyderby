class Tournament::Qualification::Scoreboard
  def initialize(tournament)
    @tournament = tournament
  end

  def rounds
    @rounds ||= tournament.qualification_rounds.order(:order)
  end

  def show_best_result?
    tournament.scoring_best_result?
  end

  def completed_rounds_desc
    @completed_rounds_desc ||= rounds.select(&:completed?).reverse
  end

  def competitors
    @competitors ||=
      Tournament::Qualification::CompetitorsCollection.new(
        tournament.competitors.includes(profile: :country, suit: :manufacturer), self
      )
  end

  def results
    @results ||= tournament.qualification_jumps.all
  end

  def results_by_competitor
    @results_by_competitor ||= results.group_by(&:competitor_id)
  end

  private

  attr_reader :tournament
end
