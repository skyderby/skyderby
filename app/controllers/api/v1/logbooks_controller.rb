module Api
  module V1
    class LogbooksController < Api::ApplicationController
      include ApiLogbookScoped

      def show
        @logbooks = ::Profiles::Logbook::KINDS.map { ::Profiles::Logbook.new(logbook_profile, kind: it) }
      end
    end
  end
end
