class Api::V1::TournamentsController < Api::ApplicationController
  def show
    @tournament =
      Tournament
      .preload(
        rounds: { matches: :slots },
        competitors: {
          profile: [:contribution_details, :country],
          suit: :manufacturer
        }
      )
      .find(params[:id])

    authorize @tournament
  end
end
