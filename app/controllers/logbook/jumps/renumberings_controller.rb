module Logbook
  module Jumps
    class RenumberingsController < ApplicationController
      include LogbookScoped

      def create
        jump = logbook_profile.jumps.kept.find(params[:jump_id])
        jump.renumber_following

        redirect_to logbook_path(kind: jump.kind)
      end
    end
  end
end
