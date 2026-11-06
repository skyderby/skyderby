module Tracks
  module Debriefs
    class FeedbacksController < ApplicationController
      def update
        page = Tracks::DebriefPage.new(Track.find(params[:track_id]), viewer: Current.user,
                                                                      debrief_id: params[:debrief_id])
        return respond_not_authorized unless page.feedbackable?(page.debrief)

        page.debrief.update!(feedback_params)
        render partial: 'tracks/debriefs/feedback', locals: { debrief: page.debrief }
      end

      private

      def feedback_params = params.expect(feedback: %i[feedback feedback_comment])
    end
  end
end
