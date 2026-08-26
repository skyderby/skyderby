class Places::SubmissionsController < ApplicationController
  PER_PAGE = 10

  before_action :authorize_review!

  def index
    @submissions =
      Place::Submission
      .chronologically
      .includes(:user, :track, place: :country)
      .page(page).per(PER_PAGE)
  end

  def show
    submission = Place::Submission.includes(:user, :track, place: :country).find(params[:id])
    @review = Places::SubmissionReview.new(submission)

    respond_to do |format|
      format.html { redirect_to place_path(@review.place) }
      format.turbo_stream
    end
  end

  private

  def authorize_review!
    respond_not_authorized unless Place.creatable?
  end
end
