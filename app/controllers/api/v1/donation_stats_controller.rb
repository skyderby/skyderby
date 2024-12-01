class Api::V1::DonationStatsController < ApplicationController
  def show
    unless current_user.admin?
      respond_not_authorized
      return
    end

    @donations =
      Contribution
      .joins(:details)
      .select(
        "date_trunc('month', received_at) AS month",
        'count(DISTINCT contribution_details.contributor_id) AS people_count',
        'sum(amount) as amount'
      )
      .group("date_trunc('month', received_at)")
      .order('month')
      .where('received_at > ?', 1.year.ago)
  end
end
