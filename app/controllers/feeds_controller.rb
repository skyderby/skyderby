class FeedsController < ApplicationController
  def show
    return head :unauthorized unless Current.user.registered?

    @feed = Profiles::Feed.new(Current.user, until_date:)
  end

  private

  def until_date
    Date.iso8601(params[:until].to_s)
  rescue Date::Error
    Time.zone.today
  end
end
