class VirtualCompetitionFacade < SimpleDelegator
  def initialize(params)
    @id = params[:id]
    @page = params[:page] || 1
    @year = params[:year]

    @competition = VirtualCompetition.includes(associations).find(@id)

    super(competition)
  end

  def scores
    public_send(scores_type)
  end

  def annual_top_scores
    competition.annual_top_scores.where(year: year)
  end

  private

  attr_reader :page, :year, :competition

  def associations
    Hash[
      scores_type,
      [
        { wingsuit: :manufacturer },
        { track: [{ place: :country }, :video] },
        :profile
      ]
    ]
  end

  def scores_type
    @scores_type ||= year ? :annual_top_scores : :personal_top_scores
  end
end
